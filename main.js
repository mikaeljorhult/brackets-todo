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
		todoTemplate = require( 'text!html/panel.html' );
	
	// Setup application.
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
	
	/** Annotation 
		description 
	*/
	function enableTodo() {
		expression = new RegExp( regex.prefix + regex.keywords.join( '|' ) + regex.suffix, 'gi' );
		Resizer.show( $todoPanel );
	}
	
	/** Annotation 
		description 
	*/
	function parseTodo() {
		var currentDoc = DocumentManager.getCurrentDocument(),
			documentText;
		
		// Check for open documents.
		if ( currentDoc !== null ) {
			documentText = currentDoc.getText();
			todos = documentText.match( expression );
			
			// Go through each todo.
			todos.forEach( function( value, index ) {
				console.log( value );
			});
		}
	}
	
	// Register extension.
	CommandManager.register( MENU_NAME, COMMAND_ID, enableTodo );
	
	// Add command to menu.
	var menu = Menus.getMenu( Menus.AppMenuBar.VIEW_MENU );
	menu.addMenuDivider();
	menu.addMenuItem( COMMAND_ID, 'Ctrl-Alt-T' );
	
	AppInit.htmlReady(function () {
		var todoHTML = Mustache.render( todoTemplate, {} ),
			todoPanel = PanelManager.createBottomPanel( 'mikaeljorhult.bracketsTodo.panel', $( todoHTML ), 100 );
		$todoPanel = $( '#brackets-todo' );		
	} );
} );