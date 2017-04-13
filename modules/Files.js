define(function (require) {
  'use strict';

  // Get dependencies.
  var ProjectManager = brackets.getModule('project/ProjectManager');

  // Variables.
  var files = [];

  function init () {

  }

  function get () {
    return files;
  }

  return {
    init: init,
    get: get
  };
});
