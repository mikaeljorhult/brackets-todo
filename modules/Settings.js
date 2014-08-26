define( function( require ) {
	'use strict';
	
	// Extension modules.
	var Events = require( 'modules/Events' ),
		
		// Variables.
		settings = {};
	
	// Subscribe to changes of settings.
	Events.subscribe( 'settings:changed', function( newSettings ) {
		settings = newSettings;
	} );
	
	// Return current settings.
	return function() {
		return settings;
	};
} );