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
  var Tags = require('modules/Tags');

  // Variables.
  var files = [];
  var colors = [];

  function init () {
    refresh();
  }

  function get () {
    return files;
  }

  function refresh () {
    var tags = Tags.get();

    ProjectManager.getAllFiles(FileUtils.filter()).done(function (filteredFiles) {
      files = filteredFiles.map(FileUtils.map);

      // Cache color of tags.
      tags.forEach(function (tag) {
        colors[tag.key] = tag.color;
      });

      // Read files.
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
        file.todos = Parser.parse(data, expression, file.file.fullPath);
        file.todos = reject(file.todos);
        file.todos = sort(file.todos);

        // Move on to next file.
        result.resolve();
      });

      return result.promise();
    }).always(function () {
      // Remove all files that do not have todos.
      files = files.filter(function (file) {
        return file.todos.length > 0;
      });

      process();

      // Parsing is done. Publish event.
      Events.publish('todos:updated');
    });
  }

  function reject (todos) {
    // Hide completed todos if requested.
    if (Settings.get().hide.done) {
      return todos.filter(function (todo) {
        // Remove todo if completed.
        return !todo.done;
      });
    }

    return todos;
  }

  function sort (todos) {
    // Sort todos if requested.
    if (Settings.get().sort.done) {
      return todos.sort(function (a, b) {
        // Sort by completion status and then line number.
        return a.done - b.done ||
          a.line - b.line;
      });
    }

    return todos;
  }

  function process () {
    var count = [];

    // Count tags and set color.
    files.forEach(function (file) {
      file.todos.forEach(function (todo) {
        // Set color of comment.
        todo.color = colors[todo.tag];

        // Update count of comment tag.
        count[todo.tag] = count[todo.tag] === undefined ? 1 : count[todo.tag] + 1;
      });
    });

    // Store count of tags with Tags module.
    Tags.count(count);
  }

  Events.subscribe('settings:loaded', function () {
    refresh();
  });

  return {
    init: init,
    get: get,
    refresh: refresh
  };
});
