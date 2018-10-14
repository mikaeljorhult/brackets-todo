/*!
 * Brackets Todo 0.9.7
 * Display all todo comments in current document or project.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define(function (require, exports, module) {
  'use strict';

  // Get dependencies.
  var Menus = brackets.getModule('command/Menus');
  var CommandManager = brackets.getModule('command/CommandManager');
  var WorkspaceManager = brackets.getModule('view/WorkspaceManager');
  var AppInit = brackets.getModule('utils/AppInit');
  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  var Preact = brackets.getModule('thirdparty/preact');
  var StatusBar = brackets.getModule('widgets/StatusBar');
  var EditorManager = brackets.getModule('editor/EditorManager');

  // Extension modules.
  var App = require('modules/App');
  var Events = require('modules/Events');
  var Files = require('modules/Files');
  var Settings = require('modules/Settings');
  var SettingsManager = require('modules/SettingsManager');
  var Strings = require('modules/Strings');
  var Tags = require('modules/Tags');

  // Mustache templates.
  var todoPanelTemplate = require('text!html/panel.html');

  // Components.
  var ResultsTableComponent = require('modules/components/ResultsTable');
  var ToolbarComponent = require('modules/components/Toolbar');

  // Setup extension.
  var $todoIcon = $('<a href="#" title="' + Strings.EXTENSION_NAME + '" id="brackets-todo-icon"></a>');
  var $statusIndicator = $('<div></div>');
  var rootElement;

  // Get view menu.
  var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);

  // Register extension.
  CommandManager.register(Strings.EXTENSION_NAME, App.COMMAND_ID, App.toggle);

  // Add command to menu.
  if (menu !== undefined) {
    menu.addMenuDivider();
    menu.addMenuItem(App.COMMAND_ID, 'Ctrl-Alt-T');
  }

  // Load stylesheet.
  ExtensionUtils.loadStyleSheet(module, 'todo.css');

  // Register event handlers.
  function registerHandlers () {
    // Subscribe to all changes to comments.
    Events.subscribe('todos:updated', function () {
      rootElement = Preact.createElement('div',
        {
          className: Settings.get().search.scope
        },
        Preact.createElement(ToolbarComponent, {
          tags: Tags.get()
        }),
        Preact.createElement(ResultsTableComponent, {
          files: Files.get()
        })
      );

      // Render content of panel.
      Preact.render(rootElement, document.getElementById('brackets-todo-container'));

      // Update status indicator.
      if (EditorManager.getActiveEditor()) {
        var file = Files.getFileByPath(EditorManager.getActiveEditor().document.file.fullPath);

        var todoCount = !file ? 0 : file.todos.filter(function isNotDone (task) {
          return !task.done;
        }).length;

        $statusIndicator.text(Strings.EXTENSION_NAME + ': ' + todoCount);
      }
    });

    // Subscribe to changes to settings.
    Events.subscribe('settings:loaded', function () {
      var settings = Settings.get();

      if (settings.interface && settings.interface.showStatusIndicator === false) {
        $statusIndicator.hide();
      } else {
        $statusIndicator.show();
      }
    });
  }

  // Register panel and setup event listeners.
  AppInit.htmlReady(function () {
    // Create panel.
    WorkspaceManager.createBottomPanel('mikaeljorhult.bracketsTodo.panel', $(todoPanelTemplate), 100);

    // Register event handlers.
    registerHandlers();

    // Add listener for toolbar icon.
    $todoIcon.click(function () {
      // Toggle panel when icon is clicked.
      CommandManager.execute(App.COMMAND_ID);
    }).appendTo('#main-toolbar .buttons');

    // Add the file status indicator to the status bar.
    StatusBar.addIndicator('status-todo-indicator', $statusIndicator, true, '', Strings.STATUS_INDICATOR_TITLE);

    // Add listener for the status indicator.
    $statusIndicator.click(function () {
      // Set autoopen flag for currently open file if not closing the panel.
      if (!SettingsManager.isExtensionEnabled() && EditorManager.getActiveEditor()) {
        var filePath = EditorManager.getActiveEditor().document.file.fullPath;

        Files.get().forEach(function (file) {
          file.autoopened = file.path === filePath;
        });
      }

      // Toggle panel when status indicator is clicked. Bypasses loading settings to preserve autoopened flag.
      App.enable(!SettingsManager.isExtensionEnabled(), true);

      // Force FileList to rerender.
      Events.publish('todos:updated');
    });

    // Enable extension if enabled last time Brackets was open.
    if (SettingsManager.isExtensionEnabled()) {
      App.enable(true, true);
    }
  });
});
