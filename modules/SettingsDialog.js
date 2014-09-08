define( function( require ) {
	'use strict';

	// Get module dependencies.
	var CommandManager = brackets.getModule( 'command/CommandManager' ),
		Commands = brackets.getModule( 'command/Commands' ),
		Dialogs = brackets.getModule( 'widgets/Dialogs' ),
		MainViewManager = brackets.getModule( 'view/MainViewManager' ),
		FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
		FileUtils = brackets.getModule( 'file/FileUtils' ),
		
		// Extension modules.
		Defaults = require( 'modules/Defaults' ),
		Paths = require( 'modules/Paths' ),
		Strings = require( 'modules/Strings' ),
		settingsDialogTemplate = require( 'text!../html/dialog-settings.html' ),

		// Variables.
		dialog,
		$dialog;

	/**
	 * Get each value of the preferences in dialog.
	 */
	function getValues() {
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
			},
			sort: {
				done: $( '#todo-settings-sort-done', $dialog ).prop( 'checked' )
			}
		};
	}

	/**
	 * Initialize dialog values.
	 */
	function initValues( settings ) {
		// Regular expression.
		$( '#todo-settings-regex-prefix' ).val( settings.regex.prefix );
		$( '#todo-settings-regex-suffix' ).val( settings.regex.suffix );
		$( '#todo-settings-tags' ).val( settings.tags.join( ', ' ) );
		
		// Case sensitive.
		$( '#todo-settings-case' ).prop( 'checked', settings.case );
		
		// Search scope.
		$( 'input[ name="todo-settings-scope" ][ value="' + settings.search.scope + '" ]' ).prop( 'checked', true );
		
		// Excludes.
		$( '#todo-settings-exclude-folders' ).val( settings.search.excludeFolders.join( ', ' ) );
		$( '#todo-settings-exclude-files' ).val( settings.search.excludeFiles.join( ', ' ) );
		
		// Sorting and filtering.
		$( '#todo-settings-sort-done' ).prop( 'checked', ( settings.sort !== undefined && settings.sort.done !== undefined ? settings.sort.done : true ) );
	}
	
	/**
	 * Test that all values are valid.
	 */
	function validateValues() {
		var values = getValues(),
			validationObject = {
				valid: true,
				invalidFields: [ 'test' ]
			};
		
		// Test regular expression.
		try {
			new RegExp(
				values.regex.prefix + 'TEST' +
				values.regex.suffix
			);
		} catch ( error ) {
			validationObject.valid = false;
			
			validationObject.invalidFields.push( 'todo-settings-regex-prefix' );
			validationObject.invalidFields.push( 'todo-settings-regex-suffix' );
		}
		
		return validationObject;
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
	
	function markInvalidFields( fields ) {
		// Reset invalid fields.
		$dialog.find( 'input' ).removeClass( 'invalid' );
		
		// Add class to each invalid field.
		fields.forEach( function( field ) {
			$( 'input[ name="' + field + '"]', $dialog ).addClass( 'invalid' );
		} );
	}
	
	function handleButton( buttonId, callback ) {
		var todoPath = Paths.todoFile(),
			fileEntry = FileSystem.getFileForPath( todoPath ),
			validation = validateValues(),
			newSettings = getValues();
		
		// Close button if cancel was clicked.
		if ( buttonId === 'cancel' ) {
			dialog.close();
		}
		
		// Save preferences if OK button was clicked.
		if ( buttonId === 'ok' ) {
			// Check that values are valid.
			if ( validation.valid === true ) {
				// Send values to callback if one is supplied.
				if ( callback ) {
					callback( newSettings );
				}
				
				// Close dialog.
				dialog.close();
			} else {
				markInvalidFields( validation.invalidFields );
			}
		} else if ( buttonId === 'save-file' ) {
			// Check that values are valid.
			if ( validation.valid === true ) {
				// Write settings to .todo as JSON.
				FileUtils.writeText( fileEntry, JSON.stringify( newSettings, null, '\t' ), true ).done( function() {
					// Open newly created file.
					CommandManager.execute( Commands.FILE_OPEN, { fullPath: todoPath } ).done( function() {
						// Set focus on editor.
						MainViewManager.focusActivePane();
					} );
				} );
				
				// Close dialog.
				dialog.close();
			} else {
				markInvalidFields( validation.invalidFields );
			}
		}
	}
	
	/**
	 * Exposed method to show dialog.
	 */
	return {
		show: function( settings, callback ) {
			// Compile dialog template.
			var compiledTemplate = Mustache.render( settingsDialogTemplate, {
				Strings: Strings
			} );
			
			// Save dialog to variable.
			dialog = Dialogs.showModalDialogUsingTemplate( compiledTemplate, false );
			$dialog = dialog.getElement();
			
			// Initialize dialog values.
			initValues( settings );
			
			// Register event listeners.
			$dialog
				.on( 'click', '.reset-preferences', function() {
					initValues( Defaults.defaultSettings );
				} )
				.on( 'click', '.dialog-button', function() {
					var buttonId = $( this ).data( 'button-id' );
					
					// Handle closing dialog.
					handleButton( buttonId, callback );
				} );
		}
	};
} );