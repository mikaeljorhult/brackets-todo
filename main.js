/** Brackets Todos Extension 
	description 
*/
define( function( require, exports, module ) {
	'use strict';
	
	// Get module dependencies.
	var CommandManager = brackets.getModule( 'command/CommandManager' ),
		Menus = brackets.getModule( 'command/Menus' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		PanelManager = brackets.getModule( 'view/PanelManager' ),
		Resizer = brackets.getModule( 'utils/Resizer' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		todoPanelTemplate = require( 'text!html/panel.html' ),
		todoResultsTemplate = require( 'text!html/results.html' );
	
	// Setup extension.
	var COMMAND_ID = 'mikaeljorhult.bracketsTodo.enable',
		MENU_NAME = 'Todo',
		regex = {
			prefix: '(?:\/\*\s*|\/\/\s*)(',
			suffix: '):\ *.*(?=\n+)',
			keywords: [ 'TODO', 'NOTE', 'FIX\s?ME', 'CHANGES' ]
		},
		todos = [],
		expression,
		$todoPanel;
	
	/** enableTodo 
		Initialize extension.
	*/
	function enableTodo() {
		expression = new RegExp( regex.prefix + regex.keywords.join( '|' ) + regex.suffix, 'gi' );
		parseTodo();
		printTodo();
		Resizer.show( $todoPanel );
	}
	
	/** parseTodo 
		Go through current document and find each comment. 
	*/
	function parseTodo() {
		var currentDoc = DocumentManager.getCurrentDocument(),
			documentText,
			matchArray;
		
		// Check for open documents.
		if ( currentDoc !== null ) {
			documentText = currentDoc.getText();
			
			while ( ( matchArray = expression.exec( documentText ) ) != null ) {
				todos.push( {
					todo: matchArray[ 0 ].replace( '\*\/', '' ).trimRight(),
					index: matchArray.index
				} );
			}
		}
	}
	
	/** printTodo 
		Take found todos and add them to panel. 
	*/
	function printTodo() {
		var resultsHTML = Mustache.render( todoResultsTemplate, { results: todos } );
		
		$todoPanel.find( '.table-container' )
			.empty()
			.append( resultsHTML );
	}
	
	// Register extension.
	CommandManager.register( MENU_NAME, COMMAND_ID, enableTodo );
	
	// Add command to menu.
	var menu = Menus.getMenu( Menus.AppMenuBar.VIEW_MENU );
	menu.addMenuDivider();
	menu.addMenuItem( COMMAND_ID, 'Ctrl-Alt-T' );
	
	
	AppInit.htmlReady( function() {
		var todoHTML = Mustache.render( todoPanelTemplate, {} ),
			todoPanel = PanelManager.createBottomPanel( 'mikaeljorhult.bracketsTodo.panel', $( todoHTML ), 100 );
		
		$todoPanel = $( '#brackets-todo' );
		
		$todoPanel.find( '.close' ).click( function() {
            Resizer.hide( $todoPanel );
        } );
	} );
} );