define(function (require) {
  'use strict';

  // Get dependencies.
  var React = brackets.getModule('thirdparty/react');

  // Components.
  var File = require('modules/components/File');

  // Return component.
  return React.createClass({
    getDefaultProps: function () {
      return {
        files: []
      };
    },

    render: function () {
      var fileElements = function (fileItem) {
        return React.createElement(File, fileItem);
      };

      return (
        React.createElement('tbody', null,
          this.props.files.map(fileElements)
        )
      );
    }
  });
});
