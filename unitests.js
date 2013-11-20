define( function( require, exports, module ) {
	'use strict';
	
	var Defaults = require( 'modules/Defaults' );
	
	describe( 'DefaultsTest', function() {
		it( 'should expose defaultPreferences variable', function() {
			expect( Defaults.defaultPreferences ).not.toBeNull();
			expect( Defaults.defaultSettings ).not.toBeNull();
		} );
	} );
} );