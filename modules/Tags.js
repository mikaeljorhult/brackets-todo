define(function (require) {
  'use strict';

  // Extension modules.
  var Events = require('modules/Events');

  // Variables.
  var tags = [];
  var hiddenTags = localStorage.getItem('hiddenTags') || [];

  /**
   * Initialize tags by building array of tag objects.
   */
  function init (newTags) {
    // Remove all tags before adding new ones.
    tags = [];

    // Build an array of possible tags.
    $.each(newTags, function (index, tag) {
      var newTag = {
        count: 0,
        visible: true
      };

      var value = typeof tag === 'object' ? tag.name : tag;

      newTag.key = cleanTagName(value);
      newTag.tag = value;
      newTag.name = cleanTagName(value);
      newTag.color = tag.color || undefined;

      // Add tag to array af tags.
      tags.push(newTag);
    });
  }

  /**
   * Return array of all available tags.
   */
  function getAll (property) {
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
   * Return array of all hidden tags.
   */
  function getHidden (onlyNames) {
    return getFiltered(false, onlyNames);
  }

  /**
   * Return array of all visible tags.
   */
  function getVisible (onlyNames) {
    return getFiltered(true, onlyNames);
  }

  /**
   * Return array of all available tags filtered by visibility.
   */
  function getFiltered (visible, onlyNames) {
    var filteredTags;

    // Default to returning only visible tags.
    visible = (visible !== undefined ? visible : true);

    // Filter array of tags according to tag visibility.
    filteredTags = tags.filter(function (tag) {
      return tag.isVisible() === visible;
    });

    // Return only names if requested.
    if (onlyNames === true) {
      // Return array of only tags of tags array.
      return filteredTags.map(function (tag) {
        return tag.tag;
      });
    }

    // Return filtered array.
    return filteredTags;
  }

  /**
   * Check if a tag is visible.
   */
  function isVisible (tagName) {
    var tag;

    // Go through all tags to find requested one.
    for (tag in tags) {
      // Return visibility state of tag if found in array.
      if (tags[tag].tag === cleanTagName(tagName)) {
        return tags[tag].isVisible();
      }
    }

    // Tag was not found.
    return false;
  }

  function saveHidden (hidden) {
    // Save in session.
    hiddenTags = hidden;

    // Save in persitent storage.
    localStorage.setItem('hiddenTags', JSON.stringify(hidden));

    // Trigger event for changed visibility.
    Events.publish('tags:visible', [hidden]);
  }

  /**
   * Get color of a tag.
   */
  function getColor (tagName) {
    var tag;

    // Go through all tags to find requested one.
    for (tag in tags) {
      // Return visibility state of tag if found in array.
      if (tags[tag].tag === cleanTagName(tagName)) {
        return tags[tag].color();
      }
    }

    // Tag was not found.
    return false;
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

    getAll: getAll,
    getHidden: getHidden,
    getVisible: getVisible,

    isVisible: isVisible,
    saveHidden: saveHidden,

    getColor: getColor
  };
});
