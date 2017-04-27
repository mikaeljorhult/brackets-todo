define(function () {
  'use strict';

  // Get dependencies.
  var CommandManager = brackets.getModule('command/CommandManager');
  var Commands = brackets.getModule('command/Commands');
  var EditorManager = brackets.getModule('editor/EditorManager');
  var MainViewManager = brackets.getModule('view/MainViewManager');
  var React = brackets.getModule('thirdparty/react');

  // Return component.
  return React.createClass({
    clickHandler: function (e) {
      var todo = this;

      // Open file that todo originate from.
      CommandManager.execute(Commands.FILE_OPEN, {fullPath: todo.props.path}).done(function () {
        // Set cursor position at start of todo.
        EditorManager.getCurrentFullEditor()
          .setCursorPos(todo.props.line - 1, todo.props.char, true);

        // Set focus on editor.
        MainViewManager.focusActivePane();
      });

      e.stopPropagation();
    },

    render: function () {
      return (
        React.createElement('tr', {
          className: 'comment ' + (this.props.done ? 'done' : ''),
          onClick: this.clickHandler
        },
          React.createElement('td', {className: 'line'},
            this.props.line
          ),
          React.createElement('td', {className: 'tag'},
            React.createElement('span', {
              className: this.props.tag,
              style: {
                backgroundColor: this.props.color
              }
            },
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
