define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Files = require('modules/Files');
  var Strings = require('modules/Strings');

  // Icons.
  var iconCollapse = require('text!images/folder.svg');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('a', {
          className: 'collapse',
          title: Strings.COLLAPSE_ALL,
          dangerouslySetInnerHTML: {__html: iconCollapse},
          onClick: function () {
            Files.collapse();
          }
        })
      );
    }
  });
});
