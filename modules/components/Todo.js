define(function () {
  'use strict';

  // Get dependencies.
  var CommandManager = brackets.getModule('command/CommandManager');
  var Commands = brackets.getModule('command/Commands');
  var EditorManager = brackets.getModule('editor/EditorManager');
  var MainViewManager = brackets.getModule('view/MainViewManager');
  var Preact = brackets.getModule('thirdparty/preact');

  // Return component.
  return Preact.createClass({
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
        Preact.createElement('tr', {
          className: 'comment ' + (this.props.done ? 'done' : ''),
          onClick: this.clickHandler
        },
          Preact.createElement('td', {className: 'line'},
            this.props.line
          ),
          Preact.createElement('td', {className: 'tag'},
            Preact.createElement('span', {
              className: this.props.tag,
              style: {
                backgroundColor: this.props.color
              }
            },
              this.props.tag
            )
          ),
          Preact.createElement('td', {className: 'message'},
            this.props.comment
          )
        )
      );
    }
  });
});
