define(function () {
  'use strict';

  /**
   * Clean tag name.
   */
  function clean (tag) {
    return tag.split(':', 1)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
  }

  // Make variables accessible.
  return {
    clean: clean
  };
});
