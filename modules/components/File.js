define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('thirdparty/preact');

  // Extension modules.
  var Files = require('modules/Files');
  var Settings = require('modules/Settings');

  // Components.
  var TodoList = require('modules/components/TodoList');

  // Variables.
  var lastScroll;

  // Return component.
  return Preact.createClass({
    componentDidUpdate: function () {
      if (this.props.autoopened && lastScroll !== this.props.path) {
        var node = Preact.findDOMNode(this);
        node.scrollIntoView();

        lastScroll = this.props.path;
      }
    },

    clickHandler: function () {
      Files.toggle(this.props.path);
    },

    render: function () {
      return (
        Preact.createElement('tr',
          {
            className: 'file ' + (Settings.get().search.scope !== 'project' || this.props.autoopened || this.props.expanded ? 'expanded' : 'collapsed')
          },
          Preact.createElement('td', null,
            Preact.createElement('div',
              {
                className: 'file-name',
                onClick: this.clickHandler
              },
              Preact.createElement('span', {className: 'jstree-sprite disclosure-triangle'}),
              this.props.name
            ),
            Preact.createElement(TodoList, {todos: this.props.todos})
          )
        )
      );
    }
  });
});
