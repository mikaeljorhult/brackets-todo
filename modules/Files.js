define( function( require ) {
	'use strict';
	
	// Extension modules.
	var File = require( 'modules/objects/File' ),
		
		// Variables.
		preferences,
		scope,
		expandedFiles;
	
	/**
	 * Initialize tags by building array of tag objects.
	 */
	function init( searchScope, prefs ) {
		// Cache preferences object.
		preferences = prefs;
		
		// Store search scope.
		scope = searchScope;
		
		// Get visible files.
		expandedFiles = preferences.get( 'expandedFiles' );
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
		return ( scope === 'project' ? expandedFiles.indexOf( path ) > -1 : true );
	}
	
	/**
	 * Toggle if file should be expanded or not.
	 */
	function toggleExpanded( path, state ) {
		var alreadyExpanded = isExpanded( path );
		
		// Check if already visible if visibility not provided as parameter.
		state = ( state === undefined ? !alreadyExpanded : state );

		// Toggle visibility state.
		if ( state ) {
			// Show if not already visible.
			if ( !alreadyExpanded ) {
				expandedFiles.push( path );
			}
		} else {
			// Hide if already visible.
			if ( alreadyExpanded ) {
				expandedFiles.splice( expandedFiles.indexOf( path ), 1 );
			}
		}
		
		// Save visibility state.
		preferences.set( 'expandedFiles', expandedFiles, { location: { scope: 'project' } } );
		preferences.save();
	}
	
	function clearExpanded() {
		expandedFiles = [];
	}
	
	// Return global methods.
	return {
		init: init,
		
		create: create,
		
		clearExpanded: clearExpanded,
		isExpanded: isExpanded,
		toggleExpanded: toggleExpanded
	};
} );