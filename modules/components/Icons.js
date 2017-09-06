define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('preact-compat');

  // Components.
  var CollapseIcon = require('modules/components/CollapseIcon');
  var ExpandIcon = require('modules/components/ExpandIcon');
  var SettingsIcon = require('modules/components/SettingsIcon');

  // Return component.
  return Preact.createClass({
    render: function () {
      return (
        Preact.createElement('div', {className: 'icons'},
          Preact.createElement(CollapseIcon),
          Preact.createElement(ExpandIcon),
          Preact.createElement(SettingsIcon)
        )
      );
    }
  });
});
