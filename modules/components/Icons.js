define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Components.
  var ExpandIcon = require('modules/components/ExpandIcon');
  var SettingsIcon = require('modules/components/SettingsIcon');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('div', {className: 'icons'},
          React.createElement(ExpandIcon),
          React.createElement(SettingsIcon)
        )
      );
    }
  });
});
