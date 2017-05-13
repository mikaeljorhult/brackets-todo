define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Files = require('modules/Files');

  // Icons.
  var iconCollapse = require('text!images/folder.svg');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('a', {
          className: 'collapse',
          dangerouslySetInnerHTML: {__html: iconCollapse},
          onClick: function () {
            Files.collapse();
          }
        })
      );
    }
  });
});
