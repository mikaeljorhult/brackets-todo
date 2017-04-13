define(function (require) {
  'use strict';

  // Variables.
  var tags = [];

  /**
   * Initialize tags by building array of tag objects.
   */
  function init (newTags) {
    // Remove all tags before adding new ones.
    tags = [];

    // Build an array of possible tags.
    $.each(newTags, function (index, tag) {
      var value = typeof tag === 'object' ? tag.name : tag;

      var newTag = {
        key: cleanTagName(value),
        tag: value,
        name: cleanTagName(value),
        color: tag.color || undefined,
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
  function get (property) {
    // Return only names if requested.
    if (typeof property === 'string') {
      // Return array of only tags of tags array.
      return tags.map(function (tag) {
        return tag[property];
      });
    }

    // Return tags as objects.
    return tags;
  }

  /**
   * Clean tag name for comparisons.
   */
  function cleanTagName (name) {
    return name.split(':', 1)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
  }

  // Return global methods.
  return {
    init: init,
    get: get
  };
});
