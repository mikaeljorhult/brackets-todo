/* global brackets, define, jQuery, $ */

define( function( require, exports, module ) {
	'use strict';
	
	// Get dependencies.
	var Defaults = require( 'modules/Defaults' ),
		PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),

		// Preferences. All preferences are managed by this module.
		preferences = PreferencesManager.getPreferenceStorage( module, Defaults.defaultPreferences ),
		VISIBLEFILES_KEY = 'visibleFiles',
		VISIBLETAGS_KEY = 'visibleTags',
		GLOBALSETTINGS_KEY = 'globalSettings',
		ENABLED_KEY = 'enabled',
		
		visibleFiles = preferences.getValue( VISIBLEFILES_KEY ),
		visibleTags = preferences.getValue( VISIBLETAGS_KEY ),
		globalSettings = preferences.getValue( GLOBALSETTINGS_KEY ),
		todoEnabled = preferences.getValue( ENABLED_KEY ),
		
		// Others
		projectSettings = null;
	
	/**
	 * Set project setting. It can only override tags.
	 * @return new settings.
	 */
	function setProjectSettings( userSettings ) {
		projectSettings = jQuery.extend( true, {}, Defaults.defaultSettings, userSettings );
		
		// Replace, don't merge, array of tags if present in user settings.
		if ( userSettings.tags !== undefined && Object.prototype.toString.call( userSettings.tags ) === '[object Array]' ) {
			projectSettings.tags = userSettings.tags;
		}
		
		// Reset because tags maybe changed
		resetVisibleTags();
		
		return projectSettings;
	}
	
	/**
	 * Get settings
	 * The priority: project settings > global settings
	 * @return settings
	 */
	function getSettings() {
		return projectSettings !== null ? projectSettings : globalSettings;
	}
	
	function isProjectScope() {
		return getSettings().search.scope === Defaults.PROJECT_SCOPE;
	}
	
	/**
	 * Set new global settings and store it
	 */
	function setGlobalSettings( newSettings ) {
		globalSettings = newSettings;
		preferences.setValue( GLOBALSETTINGS_KEY, newSettings );
		resetVisibleTags();
	}
	
	function getVisibleFiles() {
		return visibleFiles;
	}
	
	function setVisibleFiles( newVisibleFiles ) {
		visibleFiles = newVisibleFiles;
		preferences.setValue( VISIBLEFILES_KEY, visibleFiles );
	}
	
	/**
	 * Return if file should be expanded or not.
	 */
	function fileVisible( path ) {
		return ( isProjectScope() ? visibleFiles.indexOf( path ) > -1 : true );
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
		setVisibleFiles(visibleFiles);
	}
	
	function getVisibleTags() {
		return visibleTags;
	}
	
	function setVisibleTags( newVisibleTags ) {
		visibleTags = newVisibleTags;
		preferences.setValue( VISIBLETAGS_KEY, visibleTags );
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
		setVisibleTags(visibleTags);
	}
	
	function isTodoEnabled() {
		return todoEnabled;
	}
	
	function enableTodo( enabled ) {
		todoEnabled = enabled;
		preferences.setValue( ENABLED_KEY, todoEnabled );
	}
	
	/**
	 * Remove or add visible tag according to settings tags.
	 * 
	 */
	function resetVisibleTags() {
		// add missing tag.
		$.each( getSettings().tags, function( index, tag ) {
			if ( !visibleTags.hasOwnProperty( tag.toLowerCase() ) ) {
				visibleTags[ tag.toLowerCase() ] = {
					tag: tag.toLowerCase(),
					name: tag.replace( /[^a-zA-Z]/g, '' ),
					count: 0,
					visible: true
				};
			}
		} );
		
		// No need to remove old tags, because user may set the tags later.
		setVisibleTags(visibleTags);
	}
	
	// Make variables and functions accessible.
	exports.getSettings = getSettings;
	exports.setProjectSettings = setProjectSettings;
	exports.setGlobalSettings = setGlobalSettings;
	exports.isProjectScope = isProjectScope;
	
	exports.getVisibleFiles = getVisibleFiles;
	exports.setVisibleFiles = setVisibleFiles;
	exports.fileVisible = fileVisible;
	exports.toggleFileVisible = toggleFileVisible;
	
	exports.getVisibleTags = getVisibleTags;
	exports.setVisibleTags = setVisibleTags;
	exports.isTagVisible = isTagVisible;
	exports.toggleTagVisible = toggleTagVisible;
	
	exports.isTodoEnabled = isTodoEnabled;
	exports.enableTodo = enableTodo;
} );