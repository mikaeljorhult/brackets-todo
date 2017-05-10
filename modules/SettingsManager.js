define(function (require) {
  'use strict';

  // Get dependencies.
  var DocumentManager = brackets.getModule('document/DocumentManager');
  var FileUtils = brackets.getModule('file/FileUtils');
  var FileSystem = brackets.getModule('filesystem/FileSystem');
  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  var ProjectManager = brackets.getModule('project/ProjectManager');

  // Extension modules.
  var Defaults = require('modules/Defaults');
  var Events = require('modules/Events');
  var Paths = require('modules/Paths');
  var SettingsDialog = require('modules/SettingsDialog');
  var Tags = require('modules/Tags');

  // Preferences.
  var preferences = PreferencesManager.getExtensionPrefs('mikaeljorhult.bracketsTodo');

  // Variables.
  var settings;

  // Define preferences.
  preferences.definePreference('enabled', 'boolean', false);
  preferences.definePreference('userSettings', 'object', {});

  /**
   * Check for settings file, settings from setting dialog and load if it exists.
   * settings priority:
   * settings in .todo file > settings set by settings dialog > default settings
   */
  function loadSettings (callback) {
    var userSettings = getUserSettings();
    var baseSettings = mergeSettings(Defaults.defaultSettings, userSettings);

    // Load settings from .todo file if one exists in current project.
    loadTodoFile(function (fileSettings) {
      // Merge base settings with settings from file.
      settings = mergeSettings(baseSettings, fileSettings);

      // Build array of tags.
      Tags.init(settings.tags, preferences);

      // Build regular expression.
      settings.expression = setupRegExp();

      // Publish event.
      Events.publish('settings:changed', [settings]);

      // Trigger callback.
      if (callback) {
        callback();
      }

      // Publish event.
      Events.publish('settings:loaded', [settings]);
    });
  }

  function loadTodoFile (callback) {
    var fileEntry = FileSystem.getFileForPath(Paths.todoFile());
    var fileContent;
    var fileSettings = {};

    // Check if .todo exists in current project.
    fileEntry.exists(function (error, exists) {
      if (error) {
        console.log(error);
      }

      // Only load settings from .todo if it exists.
      if (exists) {
        fileContent = FileUtils.readAsText(fileEntry);

        // File is loaded asynchronous.
        fileContent.done(function (content) {
          // Catch error if JSON is invalid
          try {
            // Parse .todo file.
            fileSettings = JSON.parse(content);
          } catch (e) {
            // .todo exists but isn't valid JSON.
          }
        }).always(function () {
          callback(fileSettings);
        });
      } else {
        callback(fileSettings);
      }
    });
  }

  function mergeSettings (settings1, settings2) {
    var mergedSettings = jQuery.extend(true, {}, settings1, settings2);

    // Replace, don't merge, array of tags if present in user settings.
    if (settings2.tags !== undefined && Object.prototype.toString.call(settings2.tags) === '[object Array]') {
      mergedSettings.tags = settings2.tags;
    }

    return mergedSettings;
  }

  function getSettings () {
    return settings;
  }

  /**
   * Save and reload settings.
   */
  function setUserSettings (newSettings) {
    preferences.set('userSettings', newSettings);
    preferences.save();

    // Reload settings again.
    loadSettings();
  }

  function getUserSettings () {
    return preferences.get('userSettings');
  }

  function setupRegExp () {
    // Setup regular expression.
    return new RegExp(
      settings.regex.prefix + Tags.get().map(function (tag) { return tag.tag; }).join('|') + settings.regex.suffix,
      'g' + (settings.case !== false ? '' : 'i')
    );
  }

  /**
   * Use .todo file settings or default settings to show if no user settings before.
   */
  function showSettingsDialog () {
    var userSettings = getUserSettings();

    if (userSettings === null || userSettings === undefined || Object.keys(userSettings).length === 0) {
      userSettings = getSettings();
    }

    SettingsDialog.show(userSettings, function (newSettings) {
      setUserSettings(newSettings);
    });
  }

  function isExtensionEnabled () {
    return preferences.get('enabled');
  }

  function setExtensionEnabled (enabled) {
    preferences.set('enabled', enabled);
    preferences.save();
  }

  // Reload settings when new project is loaded.
  ProjectManager.on('projectOpen.todo', function () {
    loadSettings();
  });

  // Listeners for file changes.
  FileSystem.on('change.todo', function (event, file) {
    // Bail if not a file or file is outside current project root.
    if (file === null || file.isFile !== true || file.fullPath.indexOf(Paths.projectRoot()) === -1) {
      return false;
    }

    // Reload settings if .todo of current project was updated.
    if (file.fullPath === Paths.todoFile()) {
      loadSettings();
    }
  });

  FileSystem.on('rename.todo', function (event, oldName, newName) {
    var todoPath = Paths.todoFile();

    // Reload settings if .todo of current project was updated.
    if (newName === todoPath || oldName === todoPath) {
      loadSettings();
    }
  });

  DocumentManager.on('pathDeleted.todo', function (event, deletedPath) {
    // Reload settings if .todo of current project was deleted.
    if (deletedPath === Paths.todoFile()) {
      loadSettings();
    }
  });

  // Return module.
  return {
    // APIs about settings.
    loadSettings: loadSettings,
    showSettingsDialog: showSettingsDialog,

    // APIs about extension.
    isExtensionEnabled: isExtensionEnabled,
    setExtensionEnabled: setExtensionEnabled
  };
});
