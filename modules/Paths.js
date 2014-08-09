define( function() {
	'use strict';
	
	// Get dependencies.
	var ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		
		// Variables.
		projectRoot,
		todoFile;
	
	function getProjectRoot() {
		projectRoot = projectRoot || ProjectManager.getProjectRoot().fullPath;
		
		return projectRoot;
	}
	
	function getTodoFile() {
		todoFile = todoFile || getProjectRoot() + '.todo';
		
		return todoFile;
	}
	
	function makeRelative( path ) {
		return path.replace( getProjectRoot(), '' );
	}
	
	return {
		makeRelative: makeRelative,
		projectRoot: getProjectRoot,
		todoFile: getTodoFile
	};
} );