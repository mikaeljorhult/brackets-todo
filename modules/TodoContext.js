define( function( require, exports ) {
	'use strict';
    
    var PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
        
        SettingsManager = require( 'modules/SettingsManager' ),
    
        // Preferences.
        preferences = PreferencesManager.getExtensionPrefs( 'mikaeljorhult.bracketsTodo' ),
        
        visibleFiles,
		visibleTags;
    
    // Define preferences.
	preferences.definePreference( 'enabled', 'boolean', false );
	preferences.definePreference( 'visibleFiles', 'object', [] );
    // TODO visibleTags is not Array?
	preferences.definePreference( 'visibleTags', 'object', [] );
	
	// All files are not visible by default.
	visibleFiles = preferences.get( 'visibleFiles' );
	visibleTags = preferences.get( 'visibleTags' );
    
    /**
	 * Return if file should be expanded or not.
	 */
	function fileVisible( path ) {
		return ( SettingsManager.getSettings().search.scope === 'project' ? visibleFiles.indexOf( path ) > -1 : true );
	}
	
	/**
	 * Toggle if file should be expanded or not.
	 */
	function toggleFileVisible( path, state ) {
		var alreadyVisible = fileVisible( path );
		
		// Check if already visible if visibility not provided as parameter.
		state = ( state === undefined ? !alreadyVisible : state );
		
		// Toggle visibility state.
		if ( state ) {
			// Show if already visible.
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
		preferences.set( 'visibleFiles', visibleFiles );
		preferences.save();
	}
    
    function clearVisibleFiles() {
        visibleFiles = [];
    }
    
    function setUpTags() {
        // Build array of tags and save to preferences.
        visibleTags = initTags();
        preferences.set( 'visibleTags', visibleTags );
        preferences.save();
    }
    
    /**
	 * Initialize tags according to settings's tags.
	 * If user have not set the tag's visibility, all tags are visible by default.
	 */
	function initTags() {
		var tagArray = {};
		
		// Build an array of possible tags.
		$.each( SettingsManager.getSettings().tags, function( index, tag ) {
			tag = tag.replace( /[^a-zA-Z]/g, '' );
			
			tagArray[ tag.toLowerCase() ] = {
				tag: tag.toLowerCase(),
				name: tag,
				count: 0,
				visible: true
			};
		} );
		
		return tagArray;
	}
    
    /** 
	 * Check if tag is visible. 
	 * @return boolean True if tag is visible, otherwise false. 
	 */
	function isTagVisible( tag ) {
		var visible = false;
		
		// Check if tag exists and use that value.
		if ( visibleTags.hasOwnProperty( tag ) ) {
			visible = visibleTags[ tag ].visible;
		}
		
		return visible;
	}
    
    function getVisibleTags() {
        return visibleTags;
    }
    
    /**
	 * Toggle tag visibility.
	 */
	function toggleTagVisible( tag, state ) {
		var visible = ( state !== undefined ? state : isTagVisible( tag ) );
		
		// Toggle visibility state.
		if ( visibleTags.hasOwnProperty( tag ) ) {
			visibleTags[ tag ].visible = visible;
		}
		
		// Save visibility state.
		preferences.set( 'visibleTags', visibleTags );
		preferences.save();
	}
    
    function isExtensionEnabled() {
        return preferences.get( 'enabled' );
    }
    
    function setExtensionEnabled(enabled) {
        preferences.set( 'enabled', enabled );
		preferences.save();
    }
    
    // 
    exports.fileVisible = fileVisible;
    exports.toggleFileVisible = toggleFileVisible;
    exports.clearVisibleFiles = clearVisibleFiles;
    exports.setUpTags = setUpTags;
    exports.isTagVisible = isTagVisible;
    exports.getVisibleTags = getVisibleTags;
    exports.toggleTagVisible = toggleTagVisible;
    
    exports.isExtensionEnabled = isExtensionEnabled;
    exports.setExtensionEnabled = setExtensionEnabled;
} );