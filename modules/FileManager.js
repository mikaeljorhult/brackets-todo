/*global brackets, define */

define( function( require, exports, module ) {
	'use strict';
	
	// Get dependencies.
	var DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		
		// Declare variables.
		settings;
	
	/**
	 * Return all files to be parsed.
	 */
	function getFiles() {
		var files = [];
		
		// Get files for parsing.
		if ( settings.scope === 'project' ) {
			// Get all files in project.
			ProjectManager.getAllFiles( filter() ).done( function( fileListResult ) {
				files = fileListResult;
			} );
		} else if ( DocumentManager.getCurrentDocument() ) {
			// Get current file if one is open.
			files.push( DocumentManager.getCurrentDocument().file );
		}
		
		return files;
	}
	
	/**
	 * Return function with logic to getAllFiles() to exclude folders and files.
	 */
	function filter() {
		return function filterFunction( file ) {
			var projectRoot = ProjectManager.getProjectRoot().fullPath,
				relativePath = '^' + file.parentPath.replace( projectRoot, '' ),
				fileName = file.name,
				searchString,
				i,
				length;
			
			// Go through all exclude filters for folders and compare to current file path.
			for ( i = 0, length = settings.excludeFolders.length; i < length; i++ ) {
				searchString = settings.excludeFolders[ i ];
				
				// If root level is indicated (by first character being a slash) replace it with ^
				// to prevent matching subdirectories.
				if ( searchString.charAt( 0 ) === '/' ) {
					searchString = searchString.replace ( /^\//, '^');
				}
				
				// Check for matches in path.
				if ( relativePath.indexOf( searchString + '/' ) > -1 ) {
					return false;
				}
			}
			
			// Go through all exclude filters for files and compare to current file name.
			for ( i = 0, length = settings.excludeFiles.length; i < length; i++ ) {
				searchString = settings.excludeFiles[ i ];
				
				// Check for matches in filename.
				if ( fileName.indexOf( searchString ) > -1 ) {
					return false;
				}
			}
			
			return true;
		};
	}
	
	/**
	 * Get the settings used in getting files.
	 */
	function getSettings() {
		return settings;
	}
	
	/**
	 * Set settings used in getting files.
	 */
	function setSettings( newSettings ) {
		settings = newSettings;
	}
	
	// Make variables accessible.
	exports.getSettings = getSettings;
	exports.setSettings = setSettings;
	exports.getFiles = getFiles;
} );