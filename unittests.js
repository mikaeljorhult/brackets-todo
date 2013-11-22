/* global brackets, define, describe, it, expect, jasmine */

define( function( require, exports, module ) {
	'use strict';
	
	// Get dependencies.
		var SpecRunnerUtils = brackets.getModule( 'spec/SpecRunnerUtils' ),
			FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
			FileUtils = brackets.getModule( 'file/FileUtils' ),
			DocumentManager = brackets.getModule( 'document/DocumentManager' ),
			StringUtils = brackets.getModule( 'utils/StringUtils' ),
		
		// Get Todo modules.
		Todo = require( 'main' ),
		Defaults = require( 'modules/Defaults' ),
		ParseUtils = require( 'modules/ParseUtils' );
	
	// Setup paths and other variables.
	var extensionPath = FileUtils.getNativeModuleDirectoryPath( module ),
		testPath = extensionPath + '/unittest-files/',
		expression = new RegExp( Defaults.defaultSettings.regex.prefix + Defaults.defaultSettings.tags.join( '|' ) + Defaults.defaultSettings.regex.suffix, 'gi' );
	
	// Set matching pattern.
	ParseUtils.setExpression( expression );
	
	// Start testing!
	describe( 'Todo', function() {
		// Test module holding default values.
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
		
		// Test parsing functions.
		describe( 'ParseUtilsTest', function() {
			// Test for methods for setting and getting expression.
			it( 'should expose expression', function() {
				expect( ParseUtils.getExpression ).not.toBeNull();
				expect( ParseUtils.getExpression ).toEqual( jasmine.any( Function ) );
				
				expect( ParseUtils.setExpression ).not.toBeNull();
				expect( ParseUtils.setExpression ).toEqual( jasmine.any( Function ) );
			} );
			
			it( 'should return set expression', function() {
				var returnedExpression;
				
				// Set and get expression with module.
				ParseUtils.setExpression( expression );
				returnedExpression = ParseUtils.getExpression();
				
				// Check returned value.
				expect( returnedExpression ).toEqual( expression );
			} );
			
			// Test for parsing functions.
			it( 'should expose methods for parsing', function() {
				expect( ParseUtils.parseFile ).not.toBeNull();
				expect( ParseUtils.parseFile ).toEqual( jasmine.any( Function ) );
				
				expect( ParseUtils.parseText ).not.toBeNull();
				expect( ParseUtils.parseText ).toEqual( jasmine.any( Function ) );
			} );
			
			// Test parseText method.
			it( 'should return all comments matching expression', function() {
				var todos = [],
					fileEntry = FileSystem.getFileForPath( testPath + 'style.css' ),
					fileContent = FileUtils.readAsText( fileEntry );
				
				// Run actual fetching and parsing of document.
				runs( function() {
					fileContent.done( function( content ) {
						todos = ParseUtils.parseText( content, StringUtils.getLines( content ) );
					} );
				} );
				
				// Wait until comments are returned.
				waitsFor( function() {	
					return ( todos.length > 0 );
				}, 'Comments should be returned', 250 );
				
				// Run expectations on returned comments.
				runs( function() {
					expect( todos ).toEqual( jasmine.any( Array ) );
					expect( todos.length ).toEqual( 8 );
				} );
			} );
			
			// Test parseFile method.
			it( 'should return a file and contained comments', function() {
				var files = [],
					currentDocument;
				
				// Run actual fetching and parsing of document.
				runs( function() {
					DocumentManager.getDocumentForPath( testPath + 'style.css' ).done( function( currentDocument ) {
						files = ParseUtils.parseFile( currentDocument, files );
					} );
				} );
				
				// Wait until comments are returned.
				waitsFor( function() {	
					return ( files.length > 0 );
				}, 'A file should be returned', 250 );
				
				// Run expectations on returned comments.
				runs( function() {
					// Parsed file should have been returned.
					expect( files ).toEqual( jasmine.any( Array ) );
					expect( files.length ).toEqual( 1 );
					
					// File should contain comments.
					expect( files[ 0 ].todos ).not.toBeNull();
					expect( files[ 0 ].todos ).toEqual( jasmine.any( Array ) );
					expect( files[ 0 ].todos.length ).toEqual( 8 );
				} );
			} );
		} );
	} );
} );