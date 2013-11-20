/* global brackets, define, describe, it, expect, jasmine */

define( function( require, exports, module ) {
	'use strict';
	
	// Get dependencies.
	var Defaults = require( 'modules/Defaults' );
	
	describe( 'Todo', function() {
		describe( 'DefaultsTest', function() {
			// Test for default preferences.
			it( 'should expose defaultPreferences variable', function() {
				expect( Defaults.defaultPreferences ).not.toBeNull();
				expect( Defaults.defaultPreferences ).toEqual( jasmine.any( Object ) );
			} );
			
			// Test for default preferences.
			it( 'should expose defaultSettings variable', function() {
				expect( Defaults.defaultSettings ).not.toBeNull();
				expect( Defaults.defaultSettings ).toEqual( jasmine.any( Object ) );
			} );
		} );
	} );
} );