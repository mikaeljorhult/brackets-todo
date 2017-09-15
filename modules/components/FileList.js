define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('thirdparty/preact');

  // Components.
  var File = require('modules/components/File');

  // Return component.
  return Preact.createClass({
    getDefaultProps: function () {
      return {
        files: []
      };
    },

    render: function () {
      var fileElements = function (fileItem) {
        return Preact.createElement(File, fileItem);
      };

      return (
        Preact.createElement('tbody', null,
          this.props.files.map(fileElements)
        )
      );
    }
  });
});
