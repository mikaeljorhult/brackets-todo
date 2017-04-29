define(function () {
  'use strict';

  // Get dependencies.
  var ProjectManager = brackets.getModule('project/ProjectManager');

  // Variables.
  var projectRoot;
  var todoFile;

  /**
   * Return path to current project root.
   */
  function getProjectRoot () {
    return projectRoot;
  }

  /**
   * Return path to .todo file in current project root.
   */
  function getTodoFile () {
    return todoFile;
  }

  /**
   * Make a full path relative to project root.
   */
  function makeRelative (path) {
    return path.replace(getProjectRoot(), '');
  }

  // Reload settings when new project is loaded.
  ProjectManager.on('projectOpen.todo', function () {
    projectRoot = ProjectManager.getProjectRoot().fullPath;
    todoFile = getProjectRoot() + '.todo';
  });

  // Return module.
  return {
    makeRelative: makeRelative,
    projectRoot: getProjectRoot,
    todoFile: getTodoFile
  };
});
