define(function (require) {
  'use strict';

  // Todo modules.
  var TagUtils = require('modules/TagUtils');

  // Variables.
  var tags = [];
  var colors = {
    default: '#555',
    fixme: '#c95353',
    future: '#5a99c3',
    note: '#696',
    todo: '#d95'
  };

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
        color: tag.color || colors[cleanValue] || colors.default,
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

  /**
   * Set count of each tag.
   */
  function count (numbers) {
    // Go through array of counted tags.
    for (var index in numbers) {
      // Find tag with key of counted tag.
      tags.find(function (tag) {
        return tag.key === index;
      }).count = numbers[index];
    }
  }

  // Return global methods.
  return {
    init: init,
    get: get,
    count: count
  };
});
