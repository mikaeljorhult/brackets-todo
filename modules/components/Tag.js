define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Strings = require('modules/Strings');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('a', {
          className: this.props.visible ? 'visible' : '',
          title: Strings.SHOW_OR_HIDE + ' ' + this.props.name
        },
          this.props.name,
          React.createElement('span', {className: 'count'}, '(', this.props.count, ')')
        )
      );
    }
  });
});
