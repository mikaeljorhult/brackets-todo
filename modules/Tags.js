define(function (require) {
  'use strict';

  // Todo modules.
  var TagUtils = require('modules/TagUtils');

  // Variables.
  var tags = [];

  /**
   * Initialize tags by building array of tag objects.
   */
  function init (newTags) {
    // Remove all tags before adding new ones.
    tags = [];

    // Build an array of possible tags.
    newTags.forEach(function (tag) {
      var value = typeof tag === 'object' ? tag.name : tag;
      var cleanValue = TagUtils.clean(value);

      var newTag = {
        key: cleanValue,
        tag: value,
        name: cleanValue,
        count: 0,
        visible: true
      };

      // Add tag to array af tags.
      tags.push(newTag);
    });
  }

  /**
   * Return array of all available tags.
   */
  function get () {
    // Return tags as array of objects.
    return tags;
  }

  // Return global methods.
  return {
    init: init,
    get: get
  };
});
