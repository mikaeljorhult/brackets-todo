define( function() {
	'use strict';
	
	// Define default preferences and settings.
	var defaultPreferences = {
			enabled: false,
			visible: []
		},
		defaultSettings = {
			regex: {
				prefix: '(?:<!--|\\/\\*|\\/\\/|#) *@?(',
				suffix: '):? *(.*?) ?(?=-->|\\*/|\\n|$)',
			},
			tags: [ 'TODO', 'NOTE', 'FIX ?ME', 'CHANGES', 'FUTURE' ],
			case: false,
			search: {
				scope: 'current',
				excludeFolders: [],
				excludeFiles: []
			},
			sort: {
				done: true
			}
		};
	
	// Make variables accessible.
	return {
		defaultPreferences: defaultPreferences,
		defaultSettings: defaultSettings
	};
} );
