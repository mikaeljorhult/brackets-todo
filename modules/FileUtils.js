define(function (require) {
  'use strict';

  // Get dependencies.
  var LanguageManager = brackets.getModule('language/LanguageManager');
  var MainViewManager = brackets.getModule('view/MainViewManager');

  // Extension modules.
  var Paths = require('modules/Paths');
  var Settings = require('modules/Settings');

  /**
   * Return function with logic to getAllFiles() to exclude folders and files.
   */
  function filter () {
    return function (file) {
      var settings = Settings.get();
      var relativePath = '^' + Paths.makeRelative(file.parentPath);
      var languageID = LanguageManager.getLanguageForPath(file.fullPath).getId();
      var fileName = file.name;
      var searchString;
      var length;
      var i;

      // Don't parse files not recognized by Brackets.
      if (['unknown', 'binary', 'image'].indexOf(languageID) > -1) {
        return false;
      }

      // Check against current open file in current search scope.
      if (settings.search.scope === 'current') {
        return file === MainViewManager.getCurrentlyViewedFile();
      }

      // Get files for parsing.
      if (settings.search.scope === 'project') {
        // Go through all exclude filters for folders and compare to current file path.

        for (i = 0, length = settings.search.excludeFolders.length; i < length; i++) {
          searchString = settings.search.excludeFolders[i];

          // If root level is indicated (by first character being a slash) replace it with ^
          // to prevent matching subdirectories.
          if (searchString.charAt(0) === '/') {
            searchString = searchString.replace(/^\//, '^');
          }

          // Check for matches in path.
          if (relativePath.indexOf(searchString + '/') > -1) {
            return false;
          }
        }

        // Go through all exclude filters for files and compare to current file name.
        for (i = 0, length = settings.search.excludeFiles.length; i < length; i++) {
          searchString = settings.search.excludeFiles[i];

          // Check for matches in filename.
          if (fileName.indexOf(searchString) > -1) {
            return false;
          }
        }

        return true;
      }

      return false;
    };
  }

  /**
   * Make object from file object.
   *
   * @param file
   * @returns {Object}
   */
  function map (file) {
    return {
      key: file.fullPath,
      name: Paths.makeRelative(file.fullPath),
      path: file.fullPath,
      expanded: false,
      autoopened: false,
      file: file
    };
  }

  // Return module.
  return {
    filter: filter,
    map: map
  };
});
