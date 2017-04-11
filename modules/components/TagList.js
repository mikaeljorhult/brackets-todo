define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Components.
  var Tag = require('modules/components/Tag');

  // Return component.
  return React.createClass({
    getDefaultProps: function () {
      return {
        tags: []
      };
    },

    render: function () {
      var tagElements = function (tagItem) {
        return React.createElement(Tag, tagItem);
      };

      return (
        React.createElement('div', {
          className: 'tags'
        },
          this.props.tags.map(tagElements)
        )
      );
    }
  });
});
