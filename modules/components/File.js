define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Files = require('modules/Files');

  // Components.
  var TodoList = require('modules/components/TodoList');

  // Return component.
  return React.createClass({
    clickHandler: function () {
      Files.toggle(this.props.path);
    },

    render: function () {
      return (
        React.createElement('tr', {className: 'file ' + (this.props.expanded ? 'expanded' : 'collapsed')},
          React.createElement('td', null,
            React.createElement('div', {
              className: 'file-name',
              onClick: this.clickHandler
            },
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
