define( function( require, exports ) {
	'use strict';
	
	// Define default preferences and settings.
	var defaultPreferences = {
			enabled: false,
			visible: []
		},
		defaultSettings = {
			regex: {
				prefix: '(?:\\/\\*|\\/\\/|#) *@?(',
				suffix: '):? *(.*?) ?(?=\\*/|\\n|$)',
			},
			tags: [ 'TODO', 'NOTE', 'FIX ?ME', 'CHANGES', 'FUTURE' ],
			case: false,
			search: {
				scope: 'current',
				excludeFolders: [],
				excludeFiles: []
			}
		};
	
	// Make variables accessible.
	exports.defaultPreferences = defaultPreferences;
	exports.defaultSettings = defaultSettings;
} );