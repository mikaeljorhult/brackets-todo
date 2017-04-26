define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Tags = require('modules/Tags');

  // Components.
  var Todo = require('modules/components/Todo');

  // Return component.
  return React.createClass({
    getDefaultProps: function () {
      return {
        todos: []
      };
    },

    render: function () {
      // Get all visible tags.
      var visibleTags = Tags.get().map(function (tag) {
        if (tag.visible) {
          return tag.name;
        }
      });

      var todoElements = function (todoItem) {
        // Only render todos with visible tags.
        if (visibleTags.indexOf(todoItem.tag) > -1) {
          return React.createElement(Todo, todoItem);
        }
      };

      return (
        React.createElement('table', {className: 'table-striped todos'},
          React.createElement('tbody', null,
            this.props.todos.map(todoElements)
          )
        )
      );
    }
  });
});
