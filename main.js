/*!
 * Brackets Todo 0.1.2
 * Display all todo comments in current document.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define( function( require, exports, module ) {
	'use strict';
	
	// Get module dependencies.
	var CommandManager = brackets.getModule( 'command/CommandManager' ),
		Menus = brackets.getModule( 'command/Menus' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		PanelManager = brackets.getModule( 'view/PanelManager' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		Resizer = brackets.getModule( 'utils/Resizer' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		StringUtils = brackets.getModule( 'utils/StringUtils' ),
		ExtensionUtils = brackets.getModule( 'utils/ExtensionUtils' ),
		todoPanelTemplate = require( 'text!html/panel.html' ),
		todoResultsTemplate = require( 'text!html/results.html' );
	
	// Setup extension.
	var COMMAND_ID = 'mikaeljorhult.bracketsTodo.enable',
		MENU_NAME = 'Todo',
		regex = {
			prefix: '(?:\/\*\s*|\/\/\s*)(',
			suffix: '):\ *(.*)(?=\n+)',
			keywords: [ 'TODO', 'NOTE', 'FIX\s?ME', 'CHANGES' ]
		},
		todos = [],
		expression,
		$todoPanel;
	
	/** 
	 * Initialize extension.
	*/
	function enableTodo() {
		expression = new RegExp( regex.prefix + regex.keywords.join( '|' ) + regex.suffix, 'gi' );
		parseTodo();
		printTodo();
		listeners();
		Resizer.show( $todoPanel );
	}
	
	/**
	 * Go through current document and find each comment. 
	 */
	function parseTodo() {
		var currentDoc = DocumentManager.getCurrentDocument(),
			documentText,
			documentLines,
			matchArray;
		
		// Assume no todos.
		todos = [];
		
		// Check for open documents.
		if ( currentDoc !== null ) {
			documentText = currentDoc.getText();
			documentLines = StringUtils.getLines( documentText );
			
			// Go through each match in current document.
			while ( ( matchArray = expression.exec( documentText ) ) != null ) {
				// Add match to array.
				todos.push( {
					todo: matchArray[ 2 ].replace( '\*\/', '' ).trimRight(),
					tag: matchArray[ 1 ].toLowerCase(),
					line: StringUtils.offsetToLineNum( documentLines, matchArray.index ),
					char: matchArray.index - documentText.lastIndexOf( '\n' , matchArray.index ) - 1
				} );
			}
		}
	}
	
	/** 
	 * Take found todos and add them to panel. 
	 */
	function printTodo() {
		var resultsHTML = Mustache.render( todoResultsTemplate, { results: todos } );
		
		$todoPanel.find( '.table-container' )
			.empty()
			.append( resultsHTML )
			.on( 'click', 'tr', function( e ) {
				var $this = $( this ),
					editor = EditorManager.getCurrentFullEditor();
				
				editor.setCursorPos( $this.data( 'line' ), $this.data( 'char' ) );
				EditorManager.focusEditor();
			} );
	}
	
	/**
	 * Listen for save or refresh and look for todos when needed.
	 */
	function listeners() {
		$( DocumentManager )
			.on( 'currentDocumentChange.todo', function() {
				parseTodo();
				printTodo();
			} )
			.on( 'documentSaved.todo documentRefreshed.todo', function( event, document ) {
				if ( document === DocumentManager.getCurrentDocument() ) {
					parseTodo();
					printTodo();
				}
			} );
	}
	
	// Register extension.
	CommandManager.register( MENU_NAME, COMMAND_ID, enableTodo );
	
	// Add command to menu.
	var menu = Menus.getMenu( Menus.AppMenuBar.VIEW_MENU );
	menu.addMenuDivider();
	menu.addMenuItem( COMMAND_ID, 'Ctrl-Alt-T' );
	
	// Register panel and setup event listeners.
	AppInit.htmlReady( function() {
		var todoHTML = Mustache.render( todoPanelTemplate, {} ),
			todoPanel = PanelManager.createBottomPanel( 'mikaeljorhult.bracketsTodo.panel', $( todoHTML ), 100 );
		
		// Load stylesheet.
		ExtensionUtils.loadStyleSheet( module, 'todo.css' );
		
		// Cache todo panel.
		$todoPanel = $( '#brackets-todo' );
		
		// Close panel when close button is clicked.
		$todoPanel.find( '.close' ).click( function() {
			Resizer.hide( $todoPanel );
		} );
	} );
} );
