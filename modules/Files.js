define(function (require) {
  'use strict';

  // Get dependencies.
  var ProjectManager = brackets.getModule('project/ProjectManager');

  // Extension modules.
  var FileUtils = require('modules/FileUtils');

  // Variables.
  var files = [];

  function init () {
    refresh();
  }

  function get () {
    return files;
  }

  function refresh () {
    ProjectManager.getAllFiles(FileUtils.filter()).done(function (filteredFiles) {
      files = filteredFiles.map(FileUtils.map);
    });
  }

  return {
    init: init,
    get: get
  };
});
