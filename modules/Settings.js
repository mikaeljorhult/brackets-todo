define( function( require ) {
	'use strict';
	
	// Extension modules.
	var Events = require( 'modules/Events' ),
		
		// Variables.
		settings = {};
	
	/**
	 * Return current settings.prototype*/
	function get() {
		return settings;
	}
	
	// Subscribe to changes of settings.
	Events.subscribe( 'settings:changed', function( newSettings ) {
		settings = newSettings;
	} );
	
	// Return global methods.
	return {
		get: get
	};
} );