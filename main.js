/*!
 * Brackets Todo 0.8.2
 * Display all todo comments in current document or project.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define(function (require, exports, module) {
  'use strict';

  // Get dependencies.
  var Async = brackets.getModule('utils/Async');
  var Menus = brackets.getModule('command/Menus');
  var NativeApp = brackets.getModule('utils/NativeApp');
  var CommandManager = brackets.getModule('command/CommandManager');
  var Commands = brackets.getModule('command/Commands');
  var EditorManager = brackets.getModule('editor/EditorManager');
  var MainViewManager = brackets.getModule('view/MainViewManager');
  var DocumentManager = brackets.getModule('document/DocumentManager');
  var WorkspaceManager = brackets.getModule('view/WorkspaceManager');
  var AppInit = brackets.getModule('utils/AppInit');
  var FileSystem = brackets.getModule('filesystem/FileSystem');
  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  var React = brackets.getModule('thirdparty/react');
  var ReactDOM = brackets.getModule('thirdparty/react-dom');

  // Todo modules.
  var App = require('modules/App');
  var Events = require('modules/Events');
  var Files = require('modules/Files');
  var FileManager = require('modules/FileManager');
  var ParseUtils = require('modules/ParseUtils');
  var Paths = require('modules/Paths');
  var Settings = require('modules/Settings');
  var SettingsManager = require('modules/SettingsManager');
  var Strings = require('modules/Strings');
  var Tags = require('modules/Tags');

  // Mustache templates.
  var todoPanelTemplate = require('text!html/panel.html');

  // Components.
  var ToolbarComponent = require('modules/components/Toolbar');

  // Setup extension.
  var todos = [];
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
   * Main functionality: Find and show comments.
   */
  function run () {
    // Get all todo comments.
    findTodo();
  }

  /**
   * Go through current document and find each comment.
   */
  function findTodo (callback) {
    var filesPromise = FileManager.getFiles();
    var todoArray = [];

    filesPromise.done(function (files) {
      // Bail if no files.
      if (files.length === 0) {
        setTodos(todoArray);

        // Run callback when completed.
        if (callback) {
          callback();
        }

        return;
      }

      // Go through each file asynchronously.
      Async.doInParallel(files, function (fileInfo) {
        var result = new $.Deferred();

        // Parse each file.
        DocumentManager.getDocumentForPath(fileInfo.fullPath).done(function (currentDocument) {
          // Pass file to parsing.
          todoArray = ParseUtils.parseFile(currentDocument, todos);
        }).always(function () {
          // Move on to next file.
          result.resolve();
        });

        return result.promise();
      }).always(function () {
        // Add file visibility state.
        $.each(todoArray, function (index, file) {
          file.isExpanded(Files.isExpanded(file.path()));
        });

        // Store array of todos.
        setTodos(todoArray);

        // Run callback when completed.
        if (callback) {
          callback();
        }
      });
    });
  }

  /**
   * Store array of todos.
   */
  function setTodos (todoArray) {
    todos = todoArray;

    // Publish event.
    Events.publish('todos:updated');
  }

  /**
   * Listen for save or refresh and look for todos when needed.
   */
  function registerListeners () {
    // Listeners bound to Todo modules.
    Events.subscribe('settings:loaded', function () {
      // Empty array of files.
      setTodos([]);

      // Call parsing function.
      run();
    });

    Events.subscribe('todos:updated', function () {
      rootElement = React.createElement('div', {},
        React.createElement(ToolbarComponent, {
          tags: SettingsManager.getTags()
        })
      );

      ReactDOM.render(rootElement, document.getElementById('brackets-todo'));
    });

    // Listeners for file changes.
    FileSystem.on('change', function (event, file) {
      // Bail if not a file or file is outside current project root.
      if (file === null || file.isFile !== true || file.fullPath.indexOf(Paths.projectRoot()) === -1) {
        return false;
      }

      // Reload settings if .todo of current project was updated.
      if (file.fullPath === Paths.todoFile()) {
        SettingsManager.loadSettings();
      } else {
        // Get document from path and parse.
        DocumentManager.getDocumentForPath(file.fullPath).done(function (document) {
          setTodos(ParseUtils.parseFile(document, todos));
        });
      }
    });

    FileSystem.on('rename', function (event, oldName, newName) {
      var todoPath = Paths.todoFile();

      // Reload settings if .todo of current project was updated.
      if (newName === todoPath || oldName === todoPath) {
        SettingsManager.loadSettings();
      } else {
        // If not .todo, parse all files.
        run();
      }
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
        } else {
          // Empty stored todos and parse current document.
          setTodos(ParseUtils.parseFile(currentDocument, []));
        }
      });

    DocumentManager
      .on('pathDeleted.todo', function (event, deletedPath) {
        var todoPath = Paths.todoFile();

        // Reload settings if .todo of current project was deleted.
        if (deletedPath === todoPath) {
          SettingsManager.loadSettings();
        }

        // Parse path that was deleted to remove from list.
        setTodos(ParseUtils.removeFile(deletedPath, todos));
      });
  }

  // Register panel and setup event listeners.
  AppInit.appReady(function () {
    // Create and cache todo panel.
    WorkspaceManager.createBottomPanel('mikaeljorhult.bracketsTodo.panel', $(todoPanelTemplate), 100);
    $todoPanel = $('#brackets-todo');

    // Close panel when close button is clicked.
    $todoPanel
      .on('click', 'a[ rel="external" ]', function () {
        // Open link in default browser.
        NativeApp.openURLInDefaultBrowser($(this).data('href'));

        return false;
      })
      .on('click', '.file', function () {
        // Change classes and toggle visibility of todos.
        $(this)
          .toggleClass('expanded')
          .toggleClass('collapsed');

        // Store array of expanded files.
        Files.saveExpanded($.makeArray($todoPanel.find('.file.expanded').map(function () {
          return $(this).data('file');
        })));
      })
      .on('click', '.comment', function () {
        var $this = $(this);

        // Open file that todo originate from.
        CommandManager.execute(Commands.FILE_OPEN, {fullPath: $this.parents('.file').data('file')}).done(function () {
          // Set cursor position at start of todo.
          EditorManager.getCurrentFullEditor()
            .setCursorPos($this.data('line') - 1, $this.data('char'), true);

          // Set focus on editor.
          MainViewManager.focusActivePane();
        });

        return false;
      })
      .on('click', '.tags a', function () {
        // Show or hide clicked tag.
        var $this = $(this)
          .toggleClass('visible');

        // Save names of hidden tags.
        Tags.saveHidden($.makeArray($this.parent().children().not('.visible').map(function () {
          return $(this).data('name');
        })));

        // Update list of comments.
        Events.publish('todos:updated');
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
