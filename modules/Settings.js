define(function (require) {
  'use strict';

  // Extension modules.
  var Events = require('modules/Events');

  // Variables.
  var settings = {};

  /**
   * Return current settings
   */
  function get () {
    return settings;
  }

  // Subscribe to changes of settings.
  Events.subscribe('settings:changed', function (newSettings) {
    settings = newSettings;
  });

  // Return module.
  return {
    get: get
  };
});
