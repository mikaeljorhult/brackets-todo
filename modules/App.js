define(function (require) {
  'use strict';

  // Get dependencies.
  var CommandManager = brackets.getModule('command/CommandManager');
  var Resizer = brackets.getModule('utils/Resizer');

  // Extension modules.
  var SettingsManager = require('modules/SettingsManager');

  // Variables.
  var COMMAND_ID = 'mikaeljorhult.bracketsTodo.enable';

  /**
   * Initialize extension.
   */
  function enable (enabled, startup) {
    var $todoPanel = $('#brackets-todo');

    // Should extension be enabled or not?
    if (enabled) {
      // No need to load settings on startup as it's done on project load.
      if (startup === true) {
        // Only display panel.
        Resizer.show($todoPanel);
      } else {
        // Load settings and then show panel.
        SettingsManager.loadSettings(function () {
          // Show panel.
          Resizer.show($todoPanel);
        });
      }
    } else {
      // Hide panel.
      Resizer.hide($todoPanel);
    }

    // Set active class on icon.
    $('#brackets-todo-icon').toggleClass('active', enabled);

    // Save enabled state.
    SettingsManager.setExtensionEnabled(enabled);

    // Mark menu item as enabled/disabled.
    CommandManager.get(COMMAND_ID).setChecked(enabled);
  }

  /**
   * Set state of extension.
   */
  function toggle () {
    var enabled = SettingsManager.isExtensionEnabled();
    enable(!enabled);
  }

  // Return module.
  return {
    COMMAND_ID: COMMAND_ID,
    enable: enable,
    toggle: toggle
  };
});
