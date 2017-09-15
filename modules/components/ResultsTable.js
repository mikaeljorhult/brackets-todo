define(function (require) {
  'use strict';

  // Get dependencies.
  var Preact = brackets.getModule('thirdparty/preact');

  // Components.
  var FileList = require('modules/components/FileList');

  // Return component.
  return Preact.createClass({
    render: function () {
      return (
        Preact.createElement('div', {className: 'table-container resizable-content'},
          Preact.createElement('table', {className: 'table table-condensed table-striped'},
            Preact.createElement(FileList, {files: this.props.files})
          )
        )
      );
    }
  });
});
