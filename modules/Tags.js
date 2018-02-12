define(function (require) {
  'use strict';

  // Get dependencies.
  var _ = brackets.getModule('thirdparty/lodash');

  // Todo modules.
  var Events = require('modules/Events');
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
   *
   * @param newTags
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
    // Go through tags and set count.
    tags.forEach(function (tag) {
      tag.count = numbers[tag.key] || 0;
    });
  }

  /**
   * Toggle visibility of tag.
   *
   * @param key
   */
  function toggle (key) {
    // Get tag from array.
    var tag = _.find(tags, function (tag) {
      return tag.key === key;
    });

    tag.visible = !tag.visible;

    // Update list of comments.
    Events.publish('todos:updated');
  }

  /**
   * Toggle visibility of tags, resulting in either only the given tag being visible or if it's already the only visible, all tags but given being visible.
   *
   * @param key
   */
  function toggleSolo (key) {
    // Get tag from array.
    var tag = _.find(tags, function (tag) {
      return tag.key === key;
    });
    // Get amount of visible tags.
    var visibleTagCount = tags.filter(function (tag) {
      return tag.visible;
    }).length;

    // Check if given tag is the only visible.
    if (tag.visible && visibleTagCount === 1) {
      // Show all tags but the given.
      tags.forEach(function (tag) {
        tag.visible = tag.key !== key;
      });
    } else {
      // Hide all tags other than the given.
      tags.forEach(function (tag) {
        tag.visible = tag.key === key;
      });
    }

    // Update list of comments.
    Events.publish('todos:updated');
  }

  // Return module.
  return {
    init: init,
    get: get,
    count: count,
    toggle: toggle,
    toggleSolo: toggleSolo
  };
});
