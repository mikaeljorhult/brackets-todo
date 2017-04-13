define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

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
      var todoElements = function (todoItem) {
        return React.createElement(Todo, todoItem);
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
