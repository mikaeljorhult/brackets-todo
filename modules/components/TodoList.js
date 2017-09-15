define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('thirdparty/preact');

  // Extension modules.
  var Tags = require('modules/Tags');

  // Components.
  var Todo = require('modules/components/Todo');

  // Return component.
  return Preact.createClass({
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
          return Preact.createElement(Todo, todoItem);
        }
      };

      return (
        Preact.createElement('table', {className: 'table-striped todos'},
          Preact.createElement('tbody', null,
            this.props.todos.map(todoElements)
          )
        )
      );
    }
  });
});
