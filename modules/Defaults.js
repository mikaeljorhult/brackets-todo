define(function (require, exports) {
    'use strict';

    var CURRENT_SCOPE = 'current',
        PROJECT_SCOPE = 'project',

        // Define default preferences and settings.
        defaultPreferences = {
            enabled: false,
            visible: []
        },
        
        defaultSettings = {
            regex: {
                prefix: '(?:\\/\\*|\\/\\/|#) *@?(',
                suffix: '):? *(.*?) ?(?=\\*/|\\n|$)',
            },
            tags: ['TODO', 'NOTE', 'FIX ?ME', 'CHANGES', 'FUTURE'],
            case :false,
            search: {
                scope: 'current',
                excludeFolders: [],
                excludeFiles: []
            }
        };

    // Make variables accessible.
    exports.defaultPreferences = defaultPreferences;
    exports.defaultSettings = defaultSettings;
    exports.CURRENT_SCOPE = CURRENT_SCOPE;
    exports.PROJECT_SCOPE = PROJECT_SCOPE;
});