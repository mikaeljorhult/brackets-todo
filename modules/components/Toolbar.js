define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var App = require('modules/App');
  var Strings = require('modules/Strings');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('div', {className: 'toolbar simple-toolbar-layout'},
          React.createElement('div', {className: 'title'}, Strings.EXTENSION_NAME),
          React.createElement('a', {
            className: 'close',
            onClick: function () {
              App.enable(false);
            }
          }, '\u00D7')
        )
      );
    }
  });
});
