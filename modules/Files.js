define(function (require) {
  'use strict';

  // Get dependencies.
  var Async = brackets.getModule('utils/Async');
  var ProjectManager = brackets.getModule('project/ProjectManager');

  // Extension modules.
  var Events = require('modules/Events');
  var FileUtils = require('modules/FileUtils');
  var Parser = require('modules/Parser');
  var Settings = require('modules/Settings');

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
      read();
    });
  }

  function read () {
    // Cache regular expression.
    var expression = Settings.get().expression;

    // Go through each file asynchronously.
    Async.doInParallel(files, function (file) {
      var result = new $.Deferred();

      // Read and parse each file.
      file.file.read(function (error, data) {
        // Handle errors.
        if (error) {
          console.log(error);
        }

        // Get todos from file.
        file.todos = Parser.parse(data, expression, file.name);

        // Move on to next file.
        result.resolve();
      });

      return result.promise();
    }).always(function () {
      // Remove all files that do not have todos.
      files = files.filter(function (file) {
        return file.todos.length > 0;
      });

      // Parsing is done. Publish event.
      Events.publish('todos:updated');
    });
  }

  return {
    init: init,
    get: get
  };
});
