define(function (require, exports) {
    'use strict';

    // Get module dependencies.
    var Dialogs = brackets.getModule('widgets/Dialogs'),

        // Extension modules.
        Defaults = require('modules/Defaults'),
        Strings = require('modules/Strings'),
        settingsDialogTemplate = require('text!../html/dialog-settings.html'),

        // Variables.
        dialog;

    /**
     * get each value of the preferences in dialog.
     */
    function getValues($dialog) {

        return {
            regex: {
                prefix: $dialog.find('#todo-settings-regex-prefix').val(),
                suffix: $dialog.find('#todo-settings-regex-suffix').val(),
            },
            tags: splitByComma($dialog.find('#todo-settings-tags').val()),
            case :$dialog.find('#todo-settings-case-yes')[0].checked,
            search: {
                scope: $dialog.find('#todo-settings-scope-file')[0].checked ? Defaults.CURRENT_SCOPE : Defaults.PROJECT_SCOPE,
                excludeFolders: splitByComma($dialog.find('#todo-settings-exclude-folders').val()),
                excludeFiles: splitByComma($dialog.find('#todo-settings-exclude-files').val())
            }
        };
    }

    /**
     * check or uncheck radio button
     */
    function checkRadio(elementId, isChecked) {
        $('#' + elementId).attr('checked', isChecked);
    }

    /**
     * Initialize dialog values.
     */
    function initValues(settings) {
        $('#todo-settings-regex-prefix').val(settings.regex.prefix);
        $('#todo-settings-regex-suffix').val(settings.regex.suffix);
        $('#todo-settings-tags').val(settings.tags.join(', '));
        if (settings.case === true) {
            checkRadio('todo-settings-case-yes', true);
            checkRadio('todo-settings-case-no', false);
        } else {
            checkRadio('todo-settings-case-yes', false);
            checkRadio('todo-settings-case-no', true);
        }

        if (settings.search.scope === 'current') {
            checkRadio('todo-settings-scope-file', true);
            checkRadio('todo-settings-scope-project', false);
        } else {
            checkRadio('todo-settings-scope-file', false);
            checkRadio('todo-settings-scope-project', true);
        }
        $('#todo-settings-exclude-folders').val(settings.search.excludeFolders.join(', '));
        $('#todo-settings-exclude-files').val(settings.search.excludeFiles.join(', '));
    }

    /**
     * Split string by comma into array
     * @return {Array}
     */
    function splitByComma(value) {
        var result = [];

        if (value === null || value === undefined) {
            return result;
        }

        if (value.trim().length > 0) {

            // Filtering empty string
            $.each(value.split(','), function (index, item) {
                if (item.trim().length > 0) {
                    result.push(item.trim());
                }
            });
        }

        return result;
    }

    /**
     * Exposed method to show dialog.
     */
    exports.showDialog = function (settings, onSaveCallback) {
        // Compile dialog template.
        var compiledTemplate = Mustache.render(settingsDialogTemplate, {
            Strings: Strings
        });

        // Save dialog to variable.
        dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);

        // Initialize dialog values.
        initValues(settings);

        // Open dialog.
        dialog.done(function (buttonId) {
            // Save preferences if OK button was clicked.
            if (buttonId === 'ok') {
                var $dialog = dialog.getElement(),
                    newSettings = getValues($dialog);
                if (onSaveCallback) {
                    onSaveCallback(newSettings);
                }
            }
        });
    };
});