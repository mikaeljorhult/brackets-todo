define( function( require, exports, module ) {
	'use strict';
	
	// Get dependencies.
	var FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
		FileUtils = brackets.getModule( 'file/FileUtils' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		StringUtils = brackets.getModule( 'utils/StringUtils' ),
	
		// Get Todo modules.
		Defaults = require( 'modules/Defaults' ),
		FileManager = require( 'modules/FileManager' ),
		ParseUtils = require( 'modules/ParseUtils' ),
		SettingsManager = require( 'modules/SettingsManager' ),
	
		// Setup paths and other variables.
		extensionPath = FileUtils.getNativeModuleDirectoryPath( module ),
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
				var files = [];
				
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
		
		// Test module handling settings.
		describe( 'SettingsManagerTest', function() {
			// Test for settings getter.
			it( 'should expose getSettings method', function() {
				expect( SettingsManager.getSettings ).not.toBeNull();
				expect( SettingsManager.getSettings ).toEqual( jasmine.any( Function ) );
			} );
			
			// Test for settings setter.
			it( 'should expose setSettings method', function() {
				expect( SettingsManager.setSettings ).not.toBeNull();
				expect( SettingsManager.setSettings ).toEqual( jasmine.any( Function ) );
			} );
			
			// Test for method to merge settings.
			it( 'should expose mergeSettings method', function() {
				expect( SettingsManager.mergeSettings ).not.toBeNull();
				expect( SettingsManager.mergeSettings ).toEqual( jasmine.any( Function ) );
			} );
			
			// Test setting settings.
			it( 'should save settings when set', function() {
				var settings,
					newSettings = {
						test: 'value'
					};
				
				// Merge and get settings.
				SettingsManager.setSettings( newSettings );
				settings = SettingsManager.getSettings();
				
				// Make sure that on prefix, not suffix, vaue has been merged.
				expect( settings ).toEqual( jasmine.any( Object ) );
				expect( settings.test ).toEqual( 'value' );
			} );
			
			// Owerwriting tags.
			it( 'should overwrite only supplied settings when merging', function() {
				var settings,
					userSettings = {
						regex: {
							prefix: 'TESTVALUE'
						}
					};
				
				// Merge and get settings.
				SettingsManager.mergeSettings( userSettings );
				settings = SettingsManager.getSettings();
				
				// Make sure that on prefix, not suffix, vaue has been merged.
				expect( settings.regex ).toEqual( jasmine.any( Object ) );
				expect( settings.regex.prefix ).not.toBeNull();
				expect( settings.regex.suffix ).not.toBeNull();
				expect( settings.regex.prefix ).toEqual( 'TESTVALUE' );
			} );
			
			// Owerwriting tags.
			it( 'should overwrite tags with user supplied tags', function() {
				var settings,
					userSettings = {
						tags: [ 'TESTTAG' ]
					};
				
				// Merge and get settings.
				SettingsManager.mergeSettings( userSettings );
				settings = SettingsManager.getSettings();
				
				expect( settings.tags ).toEqual( jasmine.any( Array ) );
				expect( settings.tags.length ).toEqual( 1 );
			} );
		} );
		
		// Test module managing files to parse.
		describe( 'FileManagerTest', function() {
			// Test for file getter.
			it( 'should expose getFiles method', function() {
				expect( FileManager.getFiles ).not.toBeNull();
				expect( FileManager.getFiles ).toEqual( jasmine.any( Function ) );
			} );
		} );
	} );
} );