/*!
 * Brackets Todo 0.2.0
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
		ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		PanelManager = brackets.getModule( 'view/PanelManager' ),
		Resizer = brackets.getModule( 'utils/Resizer' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		FileUtils = brackets.getModule( 'file/FileUtils' ),
		NativeFileSystem = brackets.getModule( 'file/NativeFileSystem' ).NativeFileSystem,
		StringUtils = brackets.getModule( 'utils/StringUtils' ),
		ExtensionUtils = brackets.getModule( 'utils/ExtensionUtils' ),
		todoPanelTemplate = require( 'text!html/panel.html' ),
		todoResultsTemplate = require( 'text!html/results.html' );
	
	// Setup extension.
	var COMMAND_ID = 'mikaeljorhult.bracketsTodo.enable',
		MENU_NAME = 'Todo',
		todos = [],
		expression,
		$todoPanel,
		settings = {
			regex: {
				prefix: '(?:\\/\\*|\\/\\/) *(',
				suffix: '):? *(.*)(?=\\n+)',
			},
			tags: [ 'TODO', 'NOTE', 'FIX ?ME', 'CHANGES' ]
		};
	
	/** 
	 * Initialize extension.
	 */
	function enableTodo() {
		loadSettings( function() {
			// Setup regular expression.
			expression = new RegExp( settings.regex.prefix + settings.tags.join( '|' ) + settings.regex.suffix, 'gi' );
			
			// Parse and print todos.
			parseTodo();
			printTodo();
			
			// Setup listeners.
			listeners();
			
			// Show panel.
			Resizer.show( $todoPanel );
		} );
	}
	
	/**
	 * Check for settings file and load if it exists.
	 */
	function loadSettings( callback ) {
		var projectRoot = ProjectManager.getProjectRoot(),
			fileEntry = new NativeFileSystem.FileEntry( projectRoot.fullPath + '.todo' ),
			fileContent = FileUtils.readAsText( fileEntry ),
			userSettings = {};
		
		// File is loaded asynchronous.
		fileContent.done( function( content ) {
			// Catch error if JSON is invalid
			try {
				// Parse .todo file.
				userSettings = JSON.parse( content );
			} catch ( e ) {
				// .todo exists but isn't valid JSON.
			}
			
			// Merge default settings with JSON.
			jQuery.extend( settings, userSettings );
			
			// Trigger callback when done.
			callback();
		} ).fail( function( error ) {
			// .todo doesn't exists or couldn't be accessed.
			
			// Trigger callback.
			callback();
		} );
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
					tag: matchArray[ 1 ].replace( ' ', '' ).toLowerCase(),
					line: StringUtils.offsetToLineNum( documentLines, matchArray.index ) + 1,
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
				
				editor.setCursorPos( $this.data( 'line' ) - 1, $this.data( 'char' ) );
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
