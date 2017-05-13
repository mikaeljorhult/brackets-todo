define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Files = require('modules/Files');

  // Icons.
  var iconExpand = require('text!images/folder-open.svg');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('a', {
          className: 'expand',
          dangerouslySetInnerHTML: {__html: iconExpand},
          onClick: function () {
            Files.expand();
          }
        })
      );
    }
  });
});
