/* global define, brackets, Mustache */

define( function ( require, exports, module ) {
	'use strict';
	
	// Get dependincies.
	var CommandManager = brackets.getModule( 'command/CommandManager' ),
		Commands = brackets.getModule( 'command/Commands' ),
		Dialogs = brackets.getModule( 'widgets/Dialogs' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		FileUtils = brackets.getModule( 'file/FileUtils' ),
		FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
		ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		
		// Todo modules.
		Strings = require( 'modules/strings' ),
		
		// Templates.
		todoFileDialogTemplate = require( 'text!html/file-dialog.html' );
	
	function showDialog() {
		var dialog = Dialogs.showModalDialogUsingTemplate( 
			Mustache.render( todoFileDialogTemplate, {
				strings: Strings
			} )
		);
		
		// Wait for button to be clicked.
		dialog.done( function( id ) {
			// Create file if yes was clicked.
			if ( id === 'yes' ) {
				var projectRoot = ProjectManager.getProjectRoot().fullPath,
					createFile = ProjectManager.createNewItem( projectRoot, '.todo', true );
				
				// Create file and callback.
				createFile.done( function() {
					// Open newly created file.
					CommandManager.execute( Commands.FILE_OPEN, { fullPath: projectRoot + '.todo' } ).done( function( currentDocument ) {
						// Set focus on editor.
						EditorManager.focusEditor();
					} );
				} );
			}
		} );
	}
	
	exports.showDialog = showDialog;
} );