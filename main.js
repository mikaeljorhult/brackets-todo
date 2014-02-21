/*!
 * Brackets Todo 0.5.1
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
		PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
		ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		PanelManager = brackets.getModule( 'view/PanelManager' ),
		Resizer = brackets.getModule( 'utils/Resizer' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		FileUtils = brackets.getModule( 'file/FileUtils' ),
		FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
		ExtensionUtils = brackets.getModule( 'utils/ExtensionUtils' ),
		
		// Extension basics.
		COMMAND_ID = 'mikaeljorhult.bracketsTodo.enable',
		
		// Todo modules.
		Defaults = require( 'modules/Defaults' ),
		Events = require( 'modules/Events' ),
		FileManager = require( 'modules/FileManager' ),
		ParseUtils = require( 'modules/ParseUtils' ),
		SettingsManager = require( 'modules/SettingsManager' ),
		Strings = require( 'modules/Strings' ),
		SettingsDialog = require( 'modules/SettingsDialog' ),
		TodoFileDialog = require( 'modules/TodoFileDialog' ),
		
		// Preferences.
		preferences = PreferencesManager.getPreferenceStorage( module, Defaults.defaultPreferences ),
		visibleFiles = preferences.getValue( 'visibleFiles' ),
		visibleTags = preferences.getValue( 'visibleTags' ),
		
		// Mustache templates.
		todoPanelTemplate = require( 'text!html/panel.html' ),
		todoResultsTemplate = require( 'text!html/results.html' ),
		todoRowTemplate = require( 'text!html/row.html' ),
		todoToolbarTemplate = require( 'text!html/tools.html' ),
		
		// Setup extension.
		todos = [],
		todoFile,
		$todoPanel,
		$todoIcon = $( '<a href="#" title="' + Strings.EXTENSION_NAME + '" id="brackets-todo-icon"></a>' ),
		
		// Get view menu.
		menu = Menus.getMenu( Menus.AppMenuBar.VIEW_MENU );
	
	// All files are not visible by default.
	if ( visibleFiles === undefined ) {
		visibleFiles = [];
	}
	
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
		var enabled = preferences.getValue( 'enabled' );
		
		enableTodo( !enabled );
	}
	
	/** 
	 * Initialize extension.
	 */
	function enableTodo( enabled ) {
		if ( enabled ) {
			loadSettings( function() {
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
		preferences.setValue( 'enabled', enabled );
		
		// Mark menu item as enabled/disabled.
		CommandManager.get( COMMAND_ID ).setChecked( enabled );
	}
	
	/**
	 * Check for settings file and load if it exists.
	 */
	function loadSettings( callback ) {
		var projectRoot = ProjectManager.getProjectRoot(),
			fileEntry = FileSystem.getFileForPath( projectRoot.fullPath + '.todo' ),
			fileContent = FileUtils.readAsText( fileEntry ),
			userSettings = {};
		
		// File is loaded asynchronous.
		fileContent.done( function( content ) {
			// Catch error if JSON is invalid
			try {
				//.todo file exists.
				todoFile = true;
				
				// Parse .todo file.
				userSettings = JSON.parse( content );
			} catch ( e ) {
				// .todo exists but isn't valid JSON.
				todoFile = false;
			}
		} ).fail( function() {
			// .todo doesn't exists or couldn't be accessed.
			todoFile = false;
		} ).always( function() {
			// Merge default settings with JSON.
			SettingsManager.mergeSettings( userSettings );
			
			// Show or hide .todo indicator.
			if ( todoFile ) {
				$todoPanel.addClass( 'todo-file' );
			} else {
				$todoPanel.removeClass( 'todo-file' );
			}
			
			// Build array of tags and save to preferences.
			visibleTags = initTags();
			preferences.setValue( 'visibleTags', visibleTags );
			
			// Trigger callback.
			if ( callback ) { callback(); }
			
			// Publish event.
			Events.publish( 'settings:loaded' );
		} );
	}
	
	/**
	 * Initialize tags according to settings's tags.
	 * If user have not set the tag's visibility, all tags are visible by default.
	 */
	function initTags() {
		var tagArray = {};
		
		// Build an array of possible tags.
		$.each( SettingsManager.getSettings().tags, function( index, tag ) {
			tag = tag.replace( /[^a-zA-Z]/g, '' );
			
			tagArray[ tag.toLowerCase() ] = {
				tag: tag.toLowerCase(),
				name: tag,
				count: 0,
				visible: true
			};
		} );
		
		return tagArray;
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
				if ( callback ) { callback(); }
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
					file.visible = fileVisible( file.path );
				} );
				
				// Store array of todos.
				setTodos( todoArray );
				
				// Run callback when completed.
				if ( callback ) { callback(); }
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
			
			$( '.file.collapsed', resultsHTML )
				.nextUntil( '.file' ).hide();
		} else {
			$todoPanel.addClass( 'current' );
		}
		
		// Empty container element and apply results template.
		$todoPanel.find( '.table-container' )
			.empty()
			.append( resultsHTML );
	}
	
	/** 
	 * Check if tag is visible. 
	 * @return boolean True if tag is visible, otherwise false. 
	 */
	function isTagVisible( tag ) {
		var visible = false;
		
		// Check if tag exists and use that value.
		if ( visibleTags.hasOwnProperty( tag ) ) {
			visible = visibleTags[ tag ].visible;
		}
		
		return visible;
	}
	
	/** 
	 * Filter todos by tag. 
	 */
	function filterTodosByTag( beforeFilter ) {
		if ( beforeFilter.length === 0 ) { return beforeFilter; }
		
		// Create deep clone of array to work with.   
		var afterFilter = JSON.parse( JSON.stringify( beforeFilter ) );
		
		// Go through each file and only return those with visible comments.
		afterFilter = afterFilter.filter( function( file ) {
			// Do not return if no valid todos.
			if ( file.todos === undefined || file.todos.length < 1 ) {
				return false;
			}
			
			// Go through each comment and only return those of visible tags.
			file.todos = file.todos.filter( function( comment ) {
				return isTagVisible( comment.tag );
			} );
			
			// Check if file has any visible todos after filtering.
			return ( file.todos.length > 0 ? true : false );
		} );
		
		return afterFilter;
	}
	
	/** 
	 * Render HTML for each file row. 
	 */
	function renderTodo() {
		var resultsHTML = Mustache.render( todoRowTemplate, {
			files: filterTodosByTag( todos )
		} );
		
		return resultsHTML;
	}

	/**
	 * Count number of occurences of each tag.
	 */
	function countByTag( tag ) {
		var count = 0;
		
		// Go through each file.
		$.each( todos, function( index, file ) {
			// Go through each comment.
			$.each( file.todos, function( index, comment ) {
				// If comment is of requested type, add one to count.
				if ( comment.tag === tag ) {
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
		var tags = [],
			tag;
		
		// Create array of tags from visible tags object.
		for( tag in visibleTags ) {
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
	 * Return if file should be expanded or not.
	 */
	function fileVisible( path ) {
		return ( SettingsManager.getSettings().search.scope === 'project' ? visibleFiles.indexOf( path ) > -1 : true );
	}
	
	/**
	 * Toggle if file should be expanded or not.
	 */
	function toggleFileVisible( path, state ) {
		var alreadyVisible = fileVisible( path );
		
		// Check if already visible if visibility not provided as parameter.
		state = ( state === undefined ? !alreadyVisible : state );
		
		// Toggle visibility state.
		if ( state ) {
			// Show if already visible.
			if ( !alreadyVisible ) {
				visibleFiles.push( path );
			}
		} else {
			// Hide if already visible.
			if ( alreadyVisible ) {
				visibleFiles.splice( visibleFiles.indexOf( path ), 1 );
			}
		}
		
		// Save visibility state.
		preferences.setValue( 'visibleFiles', visibleFiles );
	}
	
	/**
	 * Toggle tag visibility.
	 */
	function toggleTagVisible( tag, state ) {
		var visible = ( state !== undefined ? state : isTagVisible( tag ) );
		
		// Toggle visibility state.
		if ( visibleTags.hasOwnProperty( tag ) ) {
			visibleTags[ tag ].visible = visible;
		}
		
		// Save visibility state.
		preferences.setValue( 'visibleTags', visibleTags );
	}
	
	/**
	 * Listen for save or refresh and look for todos when needed.
	 */
	function registerListeners() {
		var $documentManager = $( DocumentManager ),
			$projectManager = $( ProjectManager );
		
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
		
		// Listeners bound to Brackets modules.
		$documentManager
			.on( 'documentSaved.todo', function( event, document ) {
				// Reload settings if .todo of current project was updated.
				if ( document.file.fullPath === ProjectManager.getProjectRoot().fullPath + '.todo' ) {
					loadSettings();
				}
				
				// Reparse current file.
				if ( document === DocumentManager.getCurrentDocument() ) {
					setTodos( ParseUtils.parseFile( document, todos ) );
				}
			} )
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
			.on( 'fileNameChange.todo', function( event, oldName, newName ) {
				var todoPath = ProjectManager.getProjectRoot().fullPath + '.todo';
				
				// Reload settings if .todo of current project was updated.
				if ( newName === todoPath || oldName === todoPath ) {
					loadSettings();
				} else {
					// Move visibility state to new file.
					toggleFileVisible( newName, fileVisible( oldName ) );
					toggleFileVisible( oldName, false );
					
					// If not .todo, parse all files.
					run();
				}
			} )
			.on( 'pathDeleted.todo', function( event, deletedPath ) {
				var todoPath = ProjectManager.getProjectRoot().fullPath + '.todo';
				
				// Reload settings if .todo of current project was deleted.
				if ( deletedPath === todoPath ) {
					loadSettings();
				}
				
				// Remove file from visibility list.
				toggleFileVisible( document, false );
				
				// Parse path that was deleted to remove from list.
				setTodos( ParseUtils.parseFile( document, todos ) );
			} );
		
		// Reload settings when new project is loaded.
		$projectManager.on( 'projectOpen.todo', function() {
			loadSettings( function() {
				// Reset file visibility.
				visibleFiles = [];
			} );
		} );
	}
	
	// Register panel and setup event listeners.
	AppInit.appReady( function() {
		var todoHTML = Mustache.render( todoPanelTemplate, {
				todo: todoFile,
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
				var todoFilePath = ProjectManager.getProjectRoot().fullPath + '.todo';
				
				// Check if there is a file with the name .todo.
				FileSystem.resolve( todoFilePath, function( error, entry ) {
					// Check if the todo file is present.
					if ( todoFile || entry !== undefined ) {
						// Open .todo filein editor.
						CommandManager.execute( Commands.FILE_OPEN, { fullPath: todoFilePath } ).done( function() {
							// Set focus on editor.
							EditorManager.focusEditor();
						} );
					} else {
						// Show dialog for creating .todo file.
						TodoFileDialog.showDialog();
					}
				} );
			} )
			.on( 'click', '.file', function() {
				var $this = $( this );
				
				// Change classes and toggle visibility of todos.
				$this
					.toggleClass( 'expanded' )
					.toggleClass( 'collapsed' )
					.nextUntil( '.file' )
						.toggle();
				
				// Toggle file visibility.
				toggleFileVisible( $this.data( 'file' ), $this.hasClass( 'expanded' ) );
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
				toggleTagVisible( $this.data( 'name' ), $this.hasClass( 'visible' ) );
				
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
		if ( preferences.getValue( 'enabled' ) ) {
			enableTodo( true );
		}
	} );
} );
