define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Components.
  var TodoList = require('modules/components/TodoList');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('tr', {className: 'file ' + (this.props.expanded ? 'expanded' : 'collapsed')},
          React.createElement('td', null,
            React.createElement('div', {className: 'file-name'},
              React.createElement('span', {className: 'jstree-sprite disclosure-triangle'}),
              this.props.name
            ),
            React.createElement(TodoList, {todos: this.props.todos})
          )
        )
      );
    }
  });
});
