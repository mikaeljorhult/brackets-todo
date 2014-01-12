/* global brackets, define, $ */

define( function( require, exports, module ) {
	'use strict';
	
	var defaultTags = [ 'TODO', 'NOTE', 'FIX ?ME', 'CHANGES', 'FUTURE' ],
		CURRENT_SCOPE = 'current',
		PROJECT_SCOPE = 'project';
	
	/**
	 * Initialize tags according to settings's tags.
	 * All tags are visible by default.
	 * @return visibleTags
	 */
	function getDefaultVisibleTags() {
		var visibleTags = {};
		
		// Build an array of possible tags.
		$.each( defaultTags, function( index, tag ) {
			visibleTags[ tag.toLowerCase() ] = {
				tag: tag.toLowerCase(),
				name: tag.replace( /[^a-zA-Z]/g, '' ),
				count: 0,
				visible: true
			};
		} );
		
		return visibleTags;
	}
	
	// Define default preferences and settings.
	var defaultSettings = {
			regex: {
				prefix: '(?:\\/\\*|\\/\\/|#) *@?(',
				suffix: '):? *(.*?) ?(?=\\*/|\\n|$)'
			},
			tags: defaultTags,
			case: false,
			search: {
				scope: CURRENT_SCOPE,
				excludeFolders: [],
				excludeFiles: []
			}
		},
		defaultPreferences = {
			enabled: false,
			visibleFiles: [],
			visibleTags: getDefaultVisibleTags(),
			globalSettings: defaultSettings
		};

	// Make variables accessible.
	exports.defaultPreferences = defaultPreferences;
	exports.defaultSettings = defaultSettings;
	exports.CURRENT_SCOPE = CURRENT_SCOPE;
	exports.PROJECT_SCOPE = PROJECT_SCOPE;
} );