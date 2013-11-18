/*global brackets, define */

define( function( require, exports, module ) {
	'use strict';
	
	// Default preferences are different for platforms
	var defaultPreferences = {
			enabled: false,
			visible: []
		},
		defaultSettings = {
			regex: {
				prefix: '(?:\\/\\*|\\/\\/|#) *@?(',
				suffix: '):? *(.*?) ?(?=\\*/|\\n|$)',
			},
			tags: [ 'TODO', 'NOTE', 'FIX ?ME', 'CHANGES' ],
			case: false,
			search: {
				scope: 'current',
				excludeFolders: [],
				excludeFiles: []
			}
		};
	
	exports.defaultPreferences = defaultPreferences;
	exports.defaultSettings = defaultSettings;
} );