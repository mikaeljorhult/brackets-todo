define( function( require ) {
	'use strict';
	
	// Extension modules.
	var File = require( 'modules/objects/File' ),
		
		// Variables.
		scope,
		expandedFiles = JSON.parse( localStorage.getItem( 'expandedFiles' ) ) || [];
	
	/**
	 * Initialize tags by building array of tag objects.
	 */
	function init( searchScope ) {
		// Store search scope.
		scope = searchScope;
	}
	
	/**
	 * Create new file.
	 */
	function create() {
		return new File();
	}
	
	/**
	 * Return if file should be expanded or not.
	 */
	function isExpanded( path ) {
		// Return expanded state.
		return ( scope === 'project' ? expandedFiles.indexOf( path ) > -1 : true );
	}
	
	/**
	 * Save paths to expanded files.
	 */
	function saveExpanded( expanded ) {
		// Save in session.
		expandedFiles = expanded;
		
		// Save in persitent storage.
		localStorage.setItem( 'expandedFiles', JSON.stringify( expanded ) );
	}
	
	// Return global methods.
	return {
		init: init,
		
		create: create,
		
		isExpanded: isExpanded,
		saveExpanded: saveExpanded
	};
} );