define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('thirdparty/preact');

  // Extension modules.
  var Strings = require('modules/Strings');
  var Tags = require('modules/Tags');

  // Return component.
  return Preact.createClass({
    clickHandler: function () {
      Tags.toggle(this.props.name);
    },

    render: function () {
      return (
        Preact.createElement('a', {
          className: this.props.visible ? 'visible' : '',
          title: Strings.SHOW_OR_HIDE + ' ' + this.props.name,
          onClick: this.clickHandler
        },
          this.props.name,
          Preact.createElement('span', {className: 'count'}, '(', this.props.count, ')')
        )
      );
    }
  });
});
