define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var App = require('modules/App');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('a', {
          className: 'close',
          onClick: function () {
            App.enable(false);
          }
        }, '\u00D7')
      );
    }
  });
});
