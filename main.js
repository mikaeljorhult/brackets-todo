/*!
 * Brackets Todo 0.9.2
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
  var React = brackets.getModule('thirdparty/react');
  var ReactDOM = brackets.getModule('thirdparty/react-dom');

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
      rootElement = React.createElement('div',
        {
          className: Settings.get().search.scope
        },
        React.createElement(ToolbarComponent, {
          tags: Tags.get()
        }),
        React.createElement(ResultsTableComponent, {
          files: Files.get()
        })
      );

      // Render content of panel.
      ReactDOM.render(rootElement, document.getElementById('brackets-todo-container'));
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

    // Enable extension if enabled last time Brackets was open.
    if (SettingsManager.isExtensionEnabled()) {
      App.enable(true, true);
    }
  });
});
