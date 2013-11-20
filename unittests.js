define( function( require, exports, module ) {
	'use strict';
	
	var Defaults = require( 'modules/Defaults' );
	
	describe( 'Todo', function() {
		describe( 'DefaultsTest', function() {
			it( 'should expose defaultPreferences variable', function() {
				expect( Defaults.defaultPreferences ).not.toBeNull();
				expect( Defaults.defaultSettings ).not.toBeNull();
			} );
		} );
	} );
} );