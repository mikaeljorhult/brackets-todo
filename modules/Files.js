define( function() {
	'use strict';
	
	// Variables.
	var preferences,
		scope,
		visibleFiles;
	
	/**
	 * Initialize tags by building array of tag objects.
	 */
	function init( searchScope, prefs ) {
		// Cache preferences object.
		preferences = prefs;
		
		// Store search scope.
		scope = searchScope;
		
		// Get visible files.
		visibleFiles = preferences.get( 'visibleFiles' );
	}
	
	/**
	 * Return if file should be expanded or not.
	 */
	function isVisible( path ) {
		return ( scope === 'project' ? visibleFiles.indexOf( path ) > -1 : true );
	}
	
	/**
	 * Toggle if file should be expanded or not.
	 */
	function toggleVisible( path, state ) {
		var alreadyVisible = isVisible( path );
		
		// Check if already visible if visibility not provided as parameter.
		state = ( state === undefined ? !alreadyVisible : state );

		// Toggle visibility state.
		if ( state ) {
			// Show if not already visible.
			if ( !alreadyVisible ) {
				visibleFiles.push( path );
			}
		} else {
			// Hide if already visible.
			if ( alreadyVisible ) {
				visibleFiles.splice( visibleFiles.indexOf( path ), 1 );
			}
		}
		
		// Save visibility state.
		preferences.set( 'visibleFiles', visibleFiles, { location: { scope: 'project' } } );
		preferences.save();
	}
	
	function clearVisible() {
		visibleFiles = [];
	}
	
	// Return global methods.
	return {
		init: init,
		
		clearVisible: clearVisible,
		isVisible: isVisible,
		toggleVisible: toggleVisible
	};
} );