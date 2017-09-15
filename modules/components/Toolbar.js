define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('thirdparty/preact');

  // Extension modules.
  var Strings = require('modules/Strings');

  // Components.
  var CloseButton = require('modules/components/CloseButton');
  var Icons = require('modules/components/Icons');
  var TagList = require('modules/components/TagList');

  // Return component.
  return Preact.createClass({
    render: function () {
      return (
        Preact.createElement('div', {className: 'toolbar simple-toolbar-layout'},
          Preact.createElement('div', {className: 'title'}, Strings.EXTENSION_NAME),
          Preact.createElement('div', {className: 'tools'},
            Preact.createElement(TagList, {tags: this.props.tags}),
            Preact.createElement(Icons)
          ),
          Preact.createElement(CloseButton)
        )
      );
    }
  });
});
