define(function (require) {
  'use strict';

  // Get dependencies.
  var Async = brackets.getModule('utils/Async');
  var DocumentManager = brackets.getModule('document/DocumentManager');
  var MainViewManager = brackets.getModule('view/MainViewManager');
  var FileSystem = brackets.getModule('filesystem/FileSystem');
  var ProjectManager = brackets.getModule('project/ProjectManager');

  // Extension modules.
  var Events = require('modules/Events');
  var FileUtils = require('modules/FileUtils');
  var Parser = require('modules/Parser');
  var Paths = require('modules/Paths');
  var Settings = require('modules/Settings');
  var Tags = require('modules/Tags');

  // Variables.
  var files = [];
  var expression;

  /**
   * Initialize files array.
   */
  function init () {
    refresh();
  }

  /**
   * Return array of files.
   *
   * @returns {Array}
   */
  function get () {
    return files;
  }

  /**
   * Refresh all files in current project.
   */
  function refresh () {
    ProjectManager.getAllFiles(FileUtils.filter()).done(function (filteredFiles) {
      files = filteredFiles.map(FileUtils.map);

      // Cache regular expression.
      expression = Settings.get().expression;

      // Read files.
      read();
    });
  }

  /**
   * Read a single file or all files.
   *
   * @param singleFile
   */
  function read (singleFile) {
    // Go through each file asynchronously.
    Async.doInParallel(singleFile || files, readFile).always(function () {
      // Remove all files that do not have todos.
      files = files.filter(function (file) {
        return file.todos.length > 0;
      });

      // Sort file by path.
      files = files.sort(function (a, b) {
        var nameA = a.name.toLowerCase();
        var nameB = b.name.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }

        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });

      // Count used tags.
      count();

      // Parsing is done. Publish event.
      Events.publish('todos:updated');
    });
  }

  /**
   * Read and parse a single file.
   *
   * @param file
   * @returns {Promise}
   */
  function readFile (file) {
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
  }

  /**
   * Remove completed tasks according to settings.
   *
   * @param todos
   * @returns {Array}
   */
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

  /**
   * Sort tasks according to settings.
   *
   * @param todos
   * @returns {Array}
   */
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

  /**
   * Count tags used in tasks.
   */
  function count () {
    var count = [];

    // Count tags and set color.
    files.forEach(function (file) {
      file.todos.forEach(function (todo) {
        // Update count of comment tag.
        count[todo.tag] = count[todo.tag] === undefined ? 1 : count[todo.tag] + 1;
      });
    });

    // Store count of tags with Tags module.
    Tags.count(count);
  }

  /**
   * Toggle expanded state of file.
   *
   * @param key
   */
  function toggle (key) {
    var file = files.find(function (file) {
      return file.key === key;
    });

    // Toggle expanded state if file was found in array.
    if (file) {
      file.expanded = file.autoopened ? false : !file.expanded;
      file.autoopened = false;
    }

    // Update list of comments.
    Events.publish('todos:updated');
  }

  /**
   * Set all files to collapsed state.
   */
  function collapse () {
    // Expand all files.
    files.forEach(function (file) {
      file.expanded = false;
    });

    // Update list of comments.
    Events.publish('todos:updated');
  }

  /**
   * Set all files to expanded state.
   */
  function expand () {
    // Expand all files.
    files.forEach(function (file) {
      file.expanded = true;
    });

    // Update list of comments.
    Events.publish('todos:updated');
  }

  /**
   * Get array index of path.
   *
   * @param path
   * @returns {Integer}
   */
  function getFileIndex (path) {
    return files.findIndex(function (file) {
      return file.path === path;
    });
  }

  /**
   * Add array of files.
   *
   * @param file
   */
  function addPath (file) {
    files.push(FileUtils.map(file));
  }

  /**
   * Update file of path from array.
   *
   * @param path
   */
  function updatePath (path) {
    var index = getFileIndex(path);

    // Update file.
    if (index > -1) {
      read([files[index]]);

      // Update list of comments.
      Events.publish('todos:updated');
    }
  }

  /**
   * Remove file of path from array.
   *
   * @param path
   */
  function deletePath (path) {
    var index = getFileIndex(path);

    // Remove from array if file contained todos.
    if (index > -1) {
      files.splice(index, 1);

      // Update list of comments.
      Events.publish('todos:updated');
    }
  }

  /**
   * Refresh array of files when settings are changed.
   */
  Events.subscribe('settings:loaded', function () {
    refresh();
  });

  /**
   * Event handler when current file is changed.
   */
  MainViewManager.on('currentFileChange.todo', function (event, file) {
    var settings = Settings.get();

    // Bail if no file is open or if settings are not loaded.
    if (file === null || settings.search === undefined) {
      return false;
    }

    // Only one file when current scope, refresh it.
    if (settings.search.scope === 'current') {
      refresh();
    } else {
      var path = file.fullPath;

      // Expand the opened file if in array.
      files.forEach(function (file) {
        file.autoopened = file.path === path;
      });

      // Update list of comments.
      Events.publish('todos:updated');
    }
  });

  /**
   * Event handler when a file is changed.
   */
  FileSystem.on('change', function (event, file) {
    // Bail if not a file or file is outside current project root.
    if (file === null || file.isFile !== true || file.fullPath.indexOf(Paths.projectRoot()) === -1) {
      return false;
    }

    // Add the file to array for parsing if not already indexed.
    if (getFileIndex(file.fullPath) === -1) {
      addPath(file);
    }

    // Read and parse file when in array.
    updatePath(file.fullPath);
  });

  /**
   * Event handler when a file is deleted.
   */
  DocumentManager.on('pathDeleted.todo', function (event, deletedPath) {
    // Remove file from array.
    deletePath(deletedPath);
  });

  // Return module.
  return {
    init: init,
    get: get,
    refresh: refresh,
    toggle: toggle,
    collapse: collapse,
    expand: expand
  };
});
