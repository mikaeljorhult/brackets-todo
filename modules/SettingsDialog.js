define( function( require, exports ) {
	'use strict';
	
	// Get module dependencies.
	var Dialogs = brackets.getModule( 'widgets/Dialogs' ),
		
		// Extension modules.
		Strings = require( 'modules/Strings' ),
		settingsDialogTemplate = require( 'text!../html/dialog-settings.html' ),
		
		// Variables.
		dialog,
		preferences;
	
	/**
	 * Set each value of the preferences in dialog.
	 */
	function setValues( values ) {
		$( '#todo-settings-regex-prefix' ).val( values.regex.prefix );
	}
	
	/**
	 * Initialize dialog values.
	 */
	function init() {
		setValues( preferences.getAllValues() );
	}
	
	/**
	 * Exposed method to show dialog.
	 */
	exports.showDialog = function( prefs ) {
		// Compile dialog template.
		var compiledTemplate = Mustache.render( settingsDialogTemplate, {
			Strings: Strings
		} );
		
		// Save dialog to variable.
		dialog = Dialogs.showModalDialogUsingTemplate( compiledTemplate );
		preferences = prefs;
		
		// Initialize dialog values.
		init();
		
		// Open dialog.
		dialog.done( function( buttonId ) {
			// Save preferences if OK button was clicked.
			if ( buttonId === 'ok' ) {
				var $dialog = dialog.getElement();
				
				// Save each preference.
				//preferences.setValue( 'regex.prefix', $( '#todo-settings-regex-prefix', $dialog ).val() );
			}
		});
	};
});