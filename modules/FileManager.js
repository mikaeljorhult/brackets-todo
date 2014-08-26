define( function( require, exports ) {
	'use strict';
	
	// Get dependencies.
	var DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		LanguageManager = brackets.getModule( 'language/LanguageManager' ),
		ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		
		// Todo modules.
		Paths = require( 'modules/Paths' ),
		Settings = require( 'modules/Settings' );
	
	/**
	 * Return all files to be parsed.
	 */
	function getFiles() {
		return ProjectManager.getAllFiles( filter() );
	}
	
	/**
	 * Return function with logic to getAllFiles() to exclude folders and files.
	 */
	function filter() {
		return function filterFunction( file ) {
			var relativePath = '^' + Paths.makeRelative( file.parentPath ),
				languageID = LanguageManager.getLanguageForPath( file.fullPath ).getId(),
				fileName = file.name,
				searchString,
				i,
				length;
			
			// Don't parse files not recognized by Brackets.
			if ( [ 'unknown', 'binary', 'image' ].indexOf( languageID ) > -1 ) {
				return false;
			}
			
			// Get files for parsing.
			if ( Settings.get().search.scope === 'project' ) {
				// Go through all exclude filters for folders and compare to current file path.
				for ( i = 0, length = Settings.get().search.excludeFolders.length; i < length; i++ ) {
					searchString = Settings.get().search.excludeFolders[ i ];
					
					// If root level is indicated (by first character being a slash) replace it with ^
					// to prevent matching subdirectories.
					if ( searchString.charAt( 0 ) === '/' ) {
						searchString = searchString.replace ( /^\//, '^' );
					}
					
					// Check for matches in path.
					if ( relativePath.indexOf( searchString + '/' ) > -1 ) {
						return false;
					}
				}
				
				// Go through all exclude filters for files and compare to current file name.
				for ( i = 0, length = Settings.get().search.excludeFiles.length; i < length; i++ ) {
					searchString = Settings.get().search.excludeFiles[ i ];
					
					// Check for matches in filename.
					if ( fileName.indexOf( searchString ) > -1 ) {
						return false;
					}
				}
				
				return true;
			} else if ( DocumentManager.getCurrentDocument() ) {
				// Get current file if one is open.
				if ( file !== DocumentManager.getCurrentDocument().file ) {
					return false;
				}
				
				return true;
			}
			
			return false;
		};
	}
	
	// Make variables accessible.
	exports.getFiles = getFiles;
} );