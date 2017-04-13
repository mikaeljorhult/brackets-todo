define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('tr', {className: 'comment ' + (this.props.done ? 'done' : '')},
          React.createElement('td', {className: 'line'},
            this.props.line
          ),
          React.createElement('td', {className: 'tag'},
            React.createElement('span', {className: this.props.tag},
              this.props.tag
            )
          ),
          React.createElement('td', {className: 'message'},
            this.props.comment
          )
        )
      );
    }
  });
});
