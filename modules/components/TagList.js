define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('preact-compat');

  // Components.
  var Tag = require('modules/components/Tag');

  // Return component.
  return Preact.createClass({
    getDefaultProps: function () {
      return {
        tags: []
      };
    },

    render: function () {
      var tagElements = function (tagItem) {
        return Preact.createElement(Tag, tagItem);
      };

      return (
        Preact.createElement('div', {
          className: 'tags'
        },
          this.props.tags.map(tagElements)
        )
      );
    }
  });
});
