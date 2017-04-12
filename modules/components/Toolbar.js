define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Strings = require('modules/Strings');

  // Components.
  var CloseButton = require('modules/components/CloseButton');
  var Icons = require('modules/components/Icons');
  var TagList = require('modules/components/TagList');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('div', {className: 'toolbar simple-toolbar-layout'},
          React.createElement('div', {className: 'title'}, Strings.EXTENSION_NAME),
          React.createElement('div', {className: 'tools'},
            React.createElement(TagList, {tags: this.props.tags}),
            React.createElement(Icons)
          ),
          React.createElement(CloseButton)
        )
      );
    }
  });
});
