define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('preact-compat');

  // Extension modules.
  var App = require('modules/App');

  // Return component.
  return Preact.createClass({
    render: function () {
      return (
        Preact.createElement('a', {
          className: 'close',
          onClick: function () {
            App.enable(false);
          }
        }, '\u00D7')
      );
    }
  });
});
