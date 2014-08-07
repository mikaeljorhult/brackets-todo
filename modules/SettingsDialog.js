define( function( require, exports ) {
	'use strict';

	// Get module dependencies.
	var CommandManager = brackets.getModule( 'command/CommandManager' ),
		Commands = brackets.getModule( 'command/Commands' ),
		Dialogs = brackets.getModule( 'widgets/Dialogs' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
		FileUtils = brackets.getModule( 'file/FileUtils' ),
		ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		
		// Extension modules.
		Defaults = require( 'modules/Defaults' ),
		Strings = require( 'modules/Strings' ),
		settingsDialogTemplate = require( 'text!../html/dialog-settings.html' ),

		// Variables.
		dialog,
		$dialog;

	/**
	 * Get each value of the preferences in dialog.
	 */
	function getValues( $dialog ) {
		return {
			regex: {
				prefix: $( '#todo-settings-regex-prefix', $dialog ).val(),
				suffix: $( '#todo-settings-regex-suffix', $dialog ).val(),
			},
			tags: splitByComma( $dialog.find( '#todo-settings-tags' ).val() ),
			case: $( '#todo-settings-case', $dialog ).prop( 'checked' ),
			search: {
				scope: $( 'input[ name="todo-settings-scope" ]:checked', $dialog ).val(),
				excludeFolders: splitByComma( $( '#todo-settings-exclude-folders', $dialog ).val() ),
				excludeFiles: splitByComma( $( '#todo-settings-exclude-files', $dialog ).val() )
			}
		};
	}

	/**
	 * Initialize dialog values.
	 */
	function initValues( settings ) {
		$( '#todo-settings-regex-prefix' ).val( settings.regex.prefix );
		$( '#todo-settings-regex-suffix' ).val( settings.regex.suffix );
		$( '#todo-settings-tags' ).val( settings.tags.join( ', ' ) );
		
		$( '#todo-settings-case' ).prop( 'checked', settings.case );

		$( 'input[ name="todo-settings-scope" ][ value="' + settings.search.scope + '" ]' ).prop( 'checked', true );
		
		$( '#todo-settings-exclude-folders' ).val( settings.search.excludeFolders.join( ', ' ) );
		$( '#todo-settings-exclude-files' ).val( settings.search.excludeFiles.join( ', ' ) );
	}
	
	/**
	 * Split string by comma and return values as an array.
	 */
	function splitByComma( value ) {
		var result = [];
		
		// Only process string if its entered and not empty.
		if ( value && value.trim().length > 0 ) {
			// Split string and remove empty values.
			result = value.split( /\s?,\s?/ ).filter( function( item ) {
				return item.length > 0;
			} );
		}
		
		return result;
	}
	
	/**
	 * Exposed method to show dialog.
	 */
	exports.showDialog = function( settings, onSaveCallback ) {
		// Compile dialog template.
		var compiledTemplate = Mustache.render( settingsDialogTemplate, {
			Strings: Strings
		} );
		
		// Save dialog to variable.
		dialog = Dialogs.showModalDialogUsingTemplate( compiledTemplate );
		$dialog = dialog.getElement();
		
		// Initialize dialog values.
		initValues( settings );
		
		// Register event listeners.
		$dialog
			.on( 'click', '.reset-preferences', function() {
				initValues( Defaults.defaultSettings );
			} );
		
		// Open dialog.
		dialog.done( function( buttonId ) {
			var $dialog = dialog.getElement(),
				newSettings = getValues( $dialog ),
				todoPath = ProjectManager.getProjectRoot().fullPath + '.todo',
				fileEntry = FileSystem.getFileForPath( todoPath );
			
			// Save preferences if OK button was clicked.
			if ( buttonId === 'ok' ) {
				if ( onSaveCallback ) {
					onSaveCallback( newSettings );
				}
			} else if ( buttonId === 'save-file' ) {
				// Write settings to .todo as JSON.
				FileUtils.writeText( fileEntry, JSON.stringify( newSettings, null, '\t' ), true ).done( function() {
					// Open newly created file.
					CommandManager.execute( Commands.FILE_OPEN, { fullPath: todoPath } ).done( function() {
						// Set focus on editor.
						EditorManager.focusEditor();
					} );
				} );
			}
		} );
	};
} );