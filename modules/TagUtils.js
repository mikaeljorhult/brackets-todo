define(function () {
  'use strict';

  /**
   * Clean tag name.
   *
   * @param tag
   * @returns {string}
   */
  function clean (tag) {
    return tag.split(':', 1)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
  }

  // Return module.
  return {
    clean: clean
  };
});
