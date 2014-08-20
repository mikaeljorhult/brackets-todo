/*!
 * Brackets Todo 0.6.0
 * Display all todo comments in current document or project.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define( function( require, exports, module ) {
	'use strict';
	
	// Get dependencies.
	var Async = brackets.getModule( 'utils/Async' ),
		Menus = brackets.getModule( 'command/Menus' ),
		CommandManager = brackets.getModule( 'command/CommandManager' ),
		Commands = brackets.getModule( 'command/Commands' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		PanelManager = brackets.getModule( 'view/PanelManager' ),
		Resizer = brackets.getModule( 'utils/Resizer' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
		ExtensionUtils = brackets.getModule( 'utils/ExtensionUtils' ),
		
		// Extension basics.
		COMMAND_ID = 'mikaeljorhult.bracketsTodo.enable',
		
		// Todo modules.
		Events = require( 'modules/Events' ),
		FileManager = require( 'modules/FileManager' ),
		ParseUtils = require( 'modules/ParseUtils' ),
		Paths = require( 'modules/Paths' ),
		SettingsManager = require( 'modules/SettingsManager' ),
		Strings = require( 'modules/Strings' ),
		
		// Mustache templates.
		todoPanelTemplate = require( 'text!html/panel.html' ),
		todoResultsTemplate = require( 'text!html/results.html' ),
		todoRowTemplate = require( 'text!html/row.html' ),
		todoToolbarTemplate = require( 'text!html/tools.html' ),
		
		// Setup extension.
		todos = [],
		$todoPanel,
		$todoIcon = $( '<a href="#" title="' + Strings.EXTENSION_NAME + '" id="brackets-todo-icon"></a>' ),
		
		// Get view menu.
		menu = Menus.getMenu( Menus.AppMenuBar.VIEW_MENU );
	
	// Register extension.
	CommandManager.register( Strings.EXTENSION_NAME, COMMAND_ID, toggleTodo );
	
	// Add command to menu.
	if ( menu !== undefined ) {
		menu.addMenuDivider();
		menu.addMenuItem( COMMAND_ID, 'Ctrl-Alt-T' );
	}
	
	// Load stylesheet.
	ExtensionUtils.loadStyleSheet( module, 'todo.css' );
	
	/** 
	 * Set state of extension.
	 */
	function toggleTodo() {
		var enabled = SettingsManager.isExtensionEnabled();
		
		enableTodo( !enabled );
	}
	
	/** 
	 * Initialize extension.
	 */
	function enableTodo( enabled ) {
		if ( enabled ) {
			SettingsManager.loadSettings( function() {
				// Show panel.
				Resizer.show( $todoPanel );
			} );
			
			// Set active class on icon.
			$todoIcon.addClass( 'active' );
		} else {
			// Hide panel.
			Resizer.hide( $todoPanel );
			
			// Remove active class from icon.
			$todoIcon.removeClass( 'active' );
		}
		
		// Save enabled state.
		SettingsManager.setExtensionEnabled( enabled );
		
		// Mark menu item as enabled/disabled.
		CommandManager.get( COMMAND_ID ).setChecked( enabled );
	}
	
	/**
	 * Main functionality: Find and show comments.
	 */
	function run() {
		// Get all todo comments.
		findTodo();
	}
	
	/**
	 * Go through current document and find each comment. 
	 */
	function findTodo( callback ) {
		var filesPromise = FileManager.getFiles(),
			todoArray = [];
		
		filesPromise.done( function( files ) {
			// Bail if no files.
			if ( files.length === 0 ) {
				setTodos( todoArray );
				
				// Run callback when completed.
				if ( callback ) {
					callback();
				}
				
				return;
			}
			
			// Go through each file asynchronously.
			Async.doInParallel( files, function( fileInfo ) {
				var result = new $.Deferred();
				
				// Parse each file.
				DocumentManager.getDocumentForPath( fileInfo.fullPath ).done( function( currentDocument ) {
					// Pass file to parsing.
					todoArray = ParseUtils.parseFile( currentDocument, todos );
				} ).always( function() {
					// Move on to next file.
					result.resolve();
				} );
				
				return result.promise();
			} ).always( function() {
				// Add file visibility state.
				$.each( todoArray, function( index, file ) {
					file.visible = SettingsManager.fileVisible( file.path() );
				} );
				
				// Store array of todos.
				setTodos( todoArray );
				
				// Run callback when completed.
				if ( callback ) {
					callback();
				}
			} );
		} );
	}
	
	/**
	 * Store array of todos.
	 */
	function setTodos( todoArray ) {
		todos = todoArray;
		
		// Publish event.
		Events.publish( 'todos:updated' );
	}
	
	/** 
	 * Take found todos and add them to panel. 
	 */
	function printTodo() {
		var project = ( SettingsManager.getSettings().search.scope === 'project' ? true : false ),
			resultsHTML = Mustache.render( todoResultsTemplate, {
				todos: renderTodo()
			} );
		
		resultsHTML = $( resultsHTML );
		
		// Show file rows if project search scope.
		if ( project ) {
			$todoPanel.removeClass( 'current' );
		} else {
			$todoPanel.addClass( 'current' );
		}
		
		// Empty container element and apply results template.
		$todoPanel.find( '.table-container' )
			.empty()
			.append( resultsHTML );
	}
	
	/** 
	 * Filter todos by tag. 
	 */
	function filterTodosByTag( beforeFilter ) {
		// Bail if no files are available.
		if ( beforeFilter.length === 0 ) {
			return beforeFilter;
		}
		
		// Go through each file and only return those with visible comments.
		return beforeFilter.filter( function( file ) {
			return file.hasVisibleTodos();
		} );
	}
	
	/** 
	 * Render HTML for each file row. 
	 */
	function renderTodo() {
		var resultsHTML = Mustache.render( todoRowTemplate, {
			files: setTodosVisible( filterTodosByTag( todos ) )
		} );
		
		return resultsHTML;
	}
	
	/**
	 * Keep file visibility as before after file changed.
	 */
	function setTodosVisible( todos ) {
		var index = 0,
			length = todos.length;
		
		for ( index = 0; index < length; index++ ) {
			todos[ index ].visible = SettingsManager.fileVisible( todos[ index ].path() );
		}
		
		return todos;
	}
	
	/**
	 * Count number of occurences of each tag.
	 */
	function countByTag( tag ) {
		var count = 0;
		
		// Go through each file.
		$.each( todos, function( index, file ) {
			// Go through each comment.
			$.each( file.todos(), function( index, comment ) {
				// If comment is of requested type, add one to count.
				if ( comment.tag() === tag ) {
					count++;
				}
			} );
		} );
		
		return count;
	}
	
	/**
	 * Update toolbar.
	 */
	function updateTools() {
		// Render toolbar and replace old element.
		$todoPanel.find( '.tools' )
			.html( renderTools() );
	}
	
	/**
	 * Render toolbar.
	 */
	function renderTools() {
		var visibleTags = SettingsManager.getVisibleTags(),
			tags = [],
			tag;
		
		// Create array of tags from visible tags object.
		for ( tag in visibleTags ) {
			if ( visibleTags.hasOwnProperty( tag ) ) {
				visibleTags[ tag ].count = countByTag( tag );
				
				tags.push( visibleTags[ tag ] );
			}
		}
		
		// Render and return toolbar.
		return Mustache.render( todoToolbarTemplate, {
			tags: tags,
			strings: Strings
		} );
	}
	
	/**
	 * Listen for save or refresh and look for todos when needed.
	 */
	function setupRegExp() {
		// Setup regular expression.
		ParseUtils.setExpression( new RegExp(
			SettingsManager.getSettings().regex.prefix + SettingsManager.getSettings().tags.join( '|' ) + SettingsManager.getSettings().regex.suffix,
			'g' + ( SettingsManager.getSettings().case !== false ? '' : 'i' )
		) );
	}
	
	/**
	 * Listen for save or refresh and look for todos when needed.
	 */
	function registerListeners() {
		var $documentManager = $( DocumentManager );
		
		// Listeners bound to Todo modules.
		Events.subscribe( 'settings:loaded', function() {
			// Setup regular expression.
			setupRegExp();
			
			// Empty array of files.
			setTodos( [] );
			
			// Call parsing function.
			run();
		} );

		Events.subscribe( 'todos:updated', function() {
			updateTools();
			printTodo();
		} );
		
		// Listeners for file changes.
		FileSystem.on( 'change', function( event, file ) {
			// Bail if not a file or file is outside current project root.
			if ( !file.isFile || file.fullPath.indexOf( Paths.projectRoot() ) === -1 ) {
				return false;
			}
			
			// Reload settings if .todo of current project was updated.
			if ( file.fullPath === Paths.todoFile() ) {
				SettingsManager.loadSettings();
			} else {
				// Get document from path and parse.
				DocumentManager.getDocumentForPath( file.fullPath ).done( function( document ) {
					setTodos( ParseUtils.parseFile( document, todos ) );
				} );
			}
		} );
		
		FileSystem.on( 'rename', function( event, oldName, newName ) {
			var todoPath = Paths.todoFile();
			
			// Reload settings if .todo of current project was updated.
			if ( newName === todoPath || oldName === todoPath ) {
				SettingsManager.loadSettings();
			} else {
				// Move visibility state to new file.
				SettingsManager.toggleFileVisible( newName, SettingsManager.fileVisible( oldName ) );
				SettingsManager.toggleFileVisible( oldName, false );
				
				// If not .todo, parse all files.
				run();
			}
		} );
		
		// Listeners bound to Brackets modules.
		$documentManager
			.on( 'currentDocumentChange.todo', function() {
				var currentDocument = DocumentManager.getCurrentDocument(),
					$scrollTarget;
				
				// Bail if no files are open.
				if ( !currentDocument ) {
					return;
				}
				
				// No need to do anything if scope is project.
				if ( SettingsManager.getSettings().search.scope === 'project' ) {
					// Look for current file in list.
					$scrollTarget = $todoPanel.find( '.file' ).filter( '[data-file="' + currentDocument.file.fullPath + '"]' );
					
					// If there's a target, scroll to it.
					if ( $scrollTarget.length > 0 ) {
						// Close all auto-opened files before opening another.
						$scrollTarget.siblings( '.auto-opened' )
							.trigger( 'click' )
							.removeClass( 'auto-opened' );
						
						// No need to open it if already open.
						if ( !$scrollTarget.hasClass( 'expanded' ) ) {
							$scrollTarget.trigger( 'click' );
							$scrollTarget.addClass( 'auto-opened' );
						}
						
						// Scroll to target.
						$todoPanel.children( '.table-container' ).scrollTop( $scrollTarget.position().top );
					}
				} else {
					// Empty stored todos and parse current document.
					setTodos( ParseUtils.parseFile( currentDocument, [] ) );
				}
			} )
			.on( 'pathDeleted.todo', function( event, deletedPath ) {
				var todoPath = Paths.todoFile();
				
				// Reload settings if .todo of current project was deleted.
				if ( deletedPath === todoPath ) {
					SettingsManager.loadSettings();
				}
				
				// Remove file from visibility list.
				SettingsManager.toggleFileVisible( deletedPath, false );
				
				// Parse path that was deleted to remove from list.
				setTodos( ParseUtils.removeFile( deletedPath, todos ) );
			} );
	}
	
	// Register panel and setup event listeners.
	AppInit.appReady( function() {
		var todoHTML = Mustache.render( todoPanelTemplate, {
				tools: renderTools(),
				strings: Strings
			} );
		
		// Create and cache todo panel.
		PanelManager.createBottomPanel( 'mikaeljorhult.bracketsTodo.panel', $( todoHTML ), 100 );
		$todoPanel = $( '#brackets-todo' );
		
		// Close panel when close button is clicked.
		$todoPanel
			.on( 'click', '.close', function() {
				enableTodo( false );
			} )
			.on( 'click', '.indicator', function() {
				var todoFilePath = Paths.todoFile();
				
				// Check if there is a file with the name .todo.
				FileSystem.resolve( todoFilePath, function( error, entry ) {
					// Check if the todo file is present.
					if ( entry !== undefined ) {
						// Open .todo filein editor.
						CommandManager.execute( Commands.FILE_OPEN, { fullPath: todoFilePath } ).done( function() {
							// Set focus on editor.
							EditorManager.focusEditor();
						} );
					} else {
						// Show settings dialog.
						SettingsManager.showSettingsDialog();
					}
				} );
			} )
			.on( 'click', '.file', function() {
				var $this = $( this );
				
				// Change classes and toggle visibility of todos.
				$this
					.toggleClass( 'expanded' )
					.toggleClass( 'collapsed' );
				
				// Toggle file visibility.
				SettingsManager.toggleFileVisible( $this.data( 'file' ), $this.hasClass( 'expanded' ) );
			} )
			.on( 'click', '.comment', function() {
				var $this = $( this );
				
				// Open file that todo originate from.
				CommandManager.execute( Commands.FILE_OPEN, { fullPath: $this.data( 'file' ) } ).done( function() {
					// Set cursor position at start of todo.
					EditorManager.getCurrentFullEditor()
						.setCursorPos( $this.data( 'line' ) - 1, $this.data( 'char' ), true );
					
					// Set focus on editor.
					EditorManager.focusEditor();
				} );
				
				return false;
			} )
			.on( 'click', '.collapse-all', function() {
				// Click all expanded files to collapse them.
				$todoPanel.find( '.file.expanded' )
					.trigger( 'click' );
			} )
			.on( 'click', '.expand-all', function() {
				// Click all collapsed files to expand them.
				$todoPanel.find( '.file.collapsed' )
					.trigger( 'click' );
			} )
			.on( 'click', '.tags a', function() {
				// Show or hide clicked tag.
				var $this = $( this )
					.toggleClass( 'visible' );
				
				// Toggle tag visibility.
				SettingsManager.toggleTagVisible( $this.data( 'name' ), $this.hasClass( 'visible' ) );
				
				// Update list of comments.
				Events.publish( 'todos:updated' );
			} );
		
		// Setup listeners.
		registerListeners();
		
		// Add listener for toolbar icon..
		$todoIcon.click( function() {
			CommandManager.execute( COMMAND_ID );
		} ).appendTo( '#main-toolbar .buttons' );
		
		// Enable extension if loaded last time.
		if ( SettingsManager.isExtensionEnabled() ) {
			enableTodo( true );
		}
	} );
} );