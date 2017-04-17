define(function (require) {
  'use strict';

  // Get dependencies.
  var CommandManager = brackets.getModule('command/CommandManager');
  var Commands = brackets.getModule('command/Commands');
  var FileSystem = brackets.getModule('filesystem/FileSystem');
  var MainViewManager = brackets.getModule('view/MainViewManager');
  var React = brackets.getModule('thirdparty/react');

  // Extension modules.
  var Paths = require('modules/Paths');
  var SettingsManager = require('modules/SettingsManager');
  var Strings = require('modules/Strings');

  // Icons.
  var iconCog = require('text!images/cog.svg');

  // Return component.
  return React.createClass({
    render: function () {
      return (
        React.createElement('a', {
          className: 'indicator',
          title: Strings.CONFIGURE,
          dangerouslySetInnerHTML: {__html: iconCog},
          onClick: function () {
            var todoFilePath = Paths.todoFile();

            // Check if there is a file with the name .todo.
            FileSystem.resolve(todoFilePath, function (error, entry) {
              if (error) {
                console.log(error);
              }

              // Check if the .todo file is present.
              if (entry !== undefined) {
                // Open .todo file in editor.
                CommandManager.execute(Commands.FILE_OPEN, {fullPath: todoFilePath}).done(function () {
                  // Set focus on editor.
                  MainViewManager.focusActivePane();
                });
              } else {
                // Show settings dialog.
                SettingsManager.showSettingsDialog();
              }
            });
          }
        })
      );
    }
  });
});
