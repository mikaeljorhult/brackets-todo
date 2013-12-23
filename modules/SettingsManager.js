/* global brackets, define */

define( function( require, exports, module ) {
	'use strict';
	
	// Get dependencies.
	var Defaults = require( 'modules/Defaults' ),
		settings = Defaults.defaultSettings;
	
	function mergeSettings( userSettings ) {
		settings = jQuery.extend( true, {}, Defaults.defaultSettings, userSettings );
		
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