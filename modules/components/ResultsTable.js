define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Components.
  var FileList = require('modules/components/FileList');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('div', {className: 'table-container resizable-content'},
          React.createElement('table', {className: 'table table-condensed table-striped'},
            React.createElement(FileList, {files: this.props.files})
          )
        )
      );
    }
  });
});
