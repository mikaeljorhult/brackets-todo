/*!
 * Brackets Todo 0.9.0-beta
 * Display all todo comments in current document or project.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define(function (require, exports, module) {
  'use strict';

  // Get dependencies.
  var Menus = brackets.getModule('command/Menus');
  var NativeApp = brackets.getModule('utils/NativeApp');
  var CommandManager = brackets.getModule('command/CommandManager');
  var MainViewManager = brackets.getModule('view/MainViewManager');
  var DocumentManager = brackets.getModule('document/DocumentManager');
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
  var $todoPanel;
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

  /**
   * Listen for save or refresh and look for todos when needed.
   */
  function registerListeners () {
    Events.subscribe('todos:updated', function () {
      rootElement = React.createElement('div', {},
        React.createElement(ToolbarComponent, {
          tags: Tags.get()
        }),
        React.createElement(ResultsTableComponent, {
          files: Files.get()
        })
      );

      ReactDOM.render(rootElement, document.getElementById('brackets-todo-container'));
    });

    // Listeners bound to Brackets modules.
    MainViewManager
      .on('currentFileChange.todo', function () {
        var currentDocument = DocumentManager.getCurrentDocument();
        var $scrollTarget;

        // Bail if no files are open or settings have not yet been loaded.
        if (!currentDocument || Settings.get().search === undefined) {
          return;
        }

        // No need to do anything if scope is project.
        if (Settings.get().search.scope === 'project') {
          // Look for current file in list.
          $scrollTarget = $todoPanel.find('.file').filter('[data-file="' + currentDocument.file.fullPath + '"]');

          // If there's a target, scroll to it.
          if ($scrollTarget.length > 0) {
            // Close all auto-opened files before opening another.
            $scrollTarget.siblings('.auto-opened')
              .trigger('click')
              .removeClass('auto-opened');

            // No need to open it if already open.
            if (!$scrollTarget.hasClass('expanded')) {
              $scrollTarget.trigger('click');
              $scrollTarget.addClass('auto-opened');
            }

            // Scroll to target.
            $todoPanel.children('.table-container').scrollTop($scrollTarget.position().top);
          }
        }
      });
  }

  // Register panel and setup event listeners.
  AppInit.htmlReady(function () {
    // Create and cache todo panel.
    WorkspaceManager.createBottomPanel('mikaeljorhult.bracketsTodo.panel', $(todoPanelTemplate), 100);
    $todoPanel = $('#brackets-todo');

    // Close panel when close button is clicked.
    $todoPanel
      .on('click', 'a[ rel="external" ]', function () {
        // Open link in default browser.
        NativeApp.openURLInDefaultBrowser($(this).data('href'));

        return false;
      });

    // Setup listeners.
    registerListeners();

    // Add listener for toolbar icon..
    $todoIcon.click(function () {
      CommandManager.execute(App.COMMAND_ID);
    }).appendTo('#main-toolbar .buttons');

    // Enable extension if loaded last time.
    if (SettingsManager.isExtensionEnabled()) {
      App.enable(true, true);
    }
  });
});
