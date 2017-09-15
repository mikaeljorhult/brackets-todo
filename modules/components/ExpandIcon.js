define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('thirdparty/preact');

  // Extension modules.
  var Files = require('modules/Files');
  var Strings = require('modules/Strings');

  // Icons.
  var iconExpand = require('text!images/folder-open.svg');

  // Return component.
  return Preact.createClass({
    render: function () {
      return (
        Preact.createElement('a', {
          className: 'expand',
          title: Strings.EXPAND_ALL,
          dangerouslySetInnerHTML: {__html: iconExpand},
          onClick: function () {
            Files.expand();
          }
        })
      );
    }
  });
});
