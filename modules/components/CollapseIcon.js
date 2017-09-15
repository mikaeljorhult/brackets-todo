define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('thirdparty/preact');

  // Extension modules.
  var Files = require('modules/Files');
  var Strings = require('modules/Strings');

  // Icons.
  var iconCollapse = require('text!images/folder.svg');

  // Return component.
  return Preact.createClass({
    render: function () {
      return (
        Preact.createElement('a', {
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
