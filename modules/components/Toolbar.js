define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Strings = require('modules/Strings');

  // Components.
  var CloseButton = require('modules/components/CloseButton');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('div', {className: 'toolbar simple-toolbar-layout'},
          React.createElement('div', {className: 'title'}, Strings.EXTENSION_NAME),
          React.createElement('div', {className: 'tools'},
            React.createElement('div', {className: 'tags'}, 'Tags'),
            React.createElement('div', {className: 'settings'}, 'Settings')
          ),
          React.createElement(CloseButton)
        )
      );
    }
  });
});
