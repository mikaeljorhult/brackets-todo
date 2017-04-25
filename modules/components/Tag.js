define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Strings = require('modules/Strings');
  var Tags = require('modules/Tags');

  // Return component.
  return React.createClass({
    clickHandler: function () {
      Tags.toggle(this.props.name);
    },

    render: function () {
      return (
        React.createElement('a', {
          className: this.props.visible ? 'visible' : '',
          title: Strings.SHOW_OR_HIDE + ' ' + this.props.name,
          onClick: this.clickHandler
        },
          this.props.name,
          React.createElement('span', {className: 'count'}, '(', this.props.count, ')')
        )
      );
    }
  });
});
