define( function( require, exports ) {
	'use strict';
	
	// Get dependencies.
	var Defaults = require( 'modules/Defaults' ),
		settings = Defaults.defaultSettings;
	
	function mergeSettings( userSettings ) {
		settings = jQuery.extend( true, {}, Defaults.defaultSettings, userSettings );
		
		// Replace, don't merge, array of tags if present in user settings.
		if ( userSettings.tags !== undefined && Object.prototype.toString.call( userSettings.tags ) === '[object Array]' ) {
			settings.tags = userSettings.tags;
		}
		
		return settings;
	}
	
	function getSettings() {
		return settings;
	}
	
	function setSettings( newSettings ) {
		settings = newSettings;
	}
	
	// Make variables accessible.
	exports.getSettings = getSettings;
	exports.setSettings = setSettings;
	exports.mergeSettings = mergeSettings;
} );