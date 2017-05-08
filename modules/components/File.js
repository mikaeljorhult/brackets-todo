define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');
  var ReactDOM = brackets.getModule('thirdparty/react-dom');

  // Extension modules.
  var Files = require('modules/Files');
  var Settings = require('modules/Settings');

  // Components.
  var TodoList = require('modules/components/TodoList');

  // Variables.
  var lastScroll;

  // Return component.
  return React.createClass({
    componentDidUpdate: function () {
      if (this.props.autoopened && lastScroll !== this.props.path) {
        var node = ReactDOM.findDOMNode(this);
        node.scrollIntoView();

        lastScroll = this.props.path;
      }
    },

    clickHandler: function () {
      Files.toggle(this.props.path);
    },

    render: function () {
      return (
        React.createElement('tr',
          {
            className: 'file ' + (Settings.get().search.scope !== 'project' || this.props.autoopened || this.props.expanded ? 'expanded' : 'collapsed')
          },
          React.createElement('td', null,
            React.createElement('div',
              {
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
