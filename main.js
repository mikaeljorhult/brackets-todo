/*!
 * Brackets Todo 0.4.0
 * Display all todo comments in current document or project.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define( function( require, exports, module ) {
	'use strict';
	
	// Get module dependencies.
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
		StringUtils = brackets.getModule( 'utils/StringUtils' ),
		ExtensionUtils = brackets.getModule( 'utils/ExtensionUtils' ),
		todoPanelTemplate = require( 'text!html/panel.html' ),
		todoResultsTemplate = require( 'text!html/results.html' ),
		todoRowTemplate = require( 'text!html/row.html' );
	
	// Setup extension.
	var COMMAND_ID = 'mikaeljorhult.bracketsTodo.enable',
		MENU_NAME = 'Todo',
		preferences = null,
		defaultPreferences = {
			enabled: false,
			visible: []
		},
		todos = [],
		visible = [],
		todoFile,
		expression,
		$todoPanel,
		$todoIcon,
		doneRegExp = /^\[x\]/i,
		defaultSettings = {
			regex: {
				prefix: '(?:\\/\\*|\\/\\/) *@?(',
				suffix: '):? *(.*?) ?(?=\\*/|\\n|$)',
			},
			tags: [ 'TODO', 'NOTE', 'FIX ?ME', 'CHANGES' ],
			case: false,
			search: {
				scope: 'current',
				excludeFolders: [],
				excludeFiles: []
			}
		},
		settings;
	
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
				// Setup regular expression.
				setupRegExp();
				
				// Call parsing function.
				run();
				
				// Setup listeners.
				listeners();
				
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
			
			// Merge default settings with JSON.
			settings = jQuery.extend( true, {}, defaultSettings, userSettings );
			console.log( settings );
			
			// Show or hide .todo indicator.
			if ( todoFile ) {
				$todoPanel.addClass( 'todo-file' );
			} else {
				$todoPanel.removeClass( 'todo-file' );
			}
			
			// Trigger callback when done.
			callback();
		} ).fail( function( error ) {
			// .todo doesn't exists or couldn't be accessed.
			todoFile = false;
			settings = defaultSettings;
			
			// Show or hide .todo indicator.
			if ( todoFile ) {
				$todoPanel.addClass( 'todo-file' );
			} else {
				$todoPanel.removeClass( 'todo-file' );
			}
			
			// Trigger callback.
			callback();
		} );
	}
	
	/**
	 * Main functionality: Find and show comments.
	 */
	function run() {
		// Parse and print todos.
		findTodo( function() {
			printTodo();
		} );
	}
	
	/**
	 * Go through current document and find each comment. 
	 */
	function findTodo( callback ) {
		// Assume no todos.
		todos = [];
		
		if ( settings.search.scope === 'project' ) {
			// Search entire project.
			ProjectManager.getAllFiles( filter() ).done( function( fileListResult ) {
				// Go through each file asynchronously.
				Async.doInParallel( fileListResult, function( fileInfo ) {
					var result = new $.Deferred();
					
					// Search one file
					DocumentManager.getDocumentForPath( fileInfo.fullPath ).done( function( currentDocument ) {
						// Pass file to parsing.
						parseFile( currentDocument );
						
						// Move on to next file.
						result.resolve();
					} )
					.fail( function( error ) {
						// File could not be read. Move on to next file.
						result.resolve();
					} );
					
					return result.promise();
				} ).done( function() {
					// Done! Trigger callback.
					callback();
				} )
				.fail( function() {
					// Something failed. Trigger callback.
					callback();
				} );
			} );
		} else {
			// Pass current document for parsing.
			parseFile( DocumentManager.getCurrentDocument() );
			
			// Done! Trigger callback.
			callback();
		}
	}
	
	/**
	 * Return function with logic to getAllFiles() to exclude folders and files.
	 */
	function filter() {
		return function filterFunction( file ) {
			var projectRoot = ProjectManager.getProjectRoot().fullPath,
				relativePath = '^' + file.parentPath.replace( projectRoot, '' ),
				fileName = file.name,
				searchString;
			
			// Go through all exclude filters for folders and compare to current file path.
			for ( var i = 0, length = settings.search.excludeFolders.length; i < length; i++ ) {
				searchString = settings.search.excludeFolders[ i ];
				
				// If root level is indicated (by first character being a slash) replace it with ^
				// to prevent matching subdirectories.
				if ( searchString.charAt( 0 ) === '/' ) {
					searchString = searchString.replace ( /^\//, '^');
				}
				
				// Check for matches in path.
				if ( relativePath.indexOf( searchString + '/' ) > -1 ) {
					return false;
				}
			}
			
			// Go through all exclude filters for files and compare to current file name.
			for ( var i = 0, length = settings.search.excludeFiles.length; i < length; i++ ) {
				searchString = settings.search.excludeFiles[ i ];
				
				// Check for matches in filename.
				if ( fileName.indexOf( searchString ) > -1 ) {
					return false;
				}
			}
			
			return true;
		}
	}
	
	/**
	 * Pass file to parsing function.
	 */
	function parseFile( currentDocument ) {
		var documentTodos = parseText( currentDocument ),
			index = -1,
			fileToMatch = ( currentDocument === null || typeof( currentDocument ) === 'string' ? currentDocument : currentDocument.file.fullPath );
		
		// Check if file has already been added to array.
		for ( var i = 0, length = todos.length; i < length; i++ ) {
			if ( todos[ i ].path == fileToMatch ) {
				// File found in array, store index.
				index = i;
				break;
			}
		}
		
		// Add file to array if any comments is found.
		if ( documentTodos.length > 0 ) {
			// Create object for new entry in array if none found.
			if ( index == -1 ) {
				todos.push( {} );
				index = length;
			}
			
			// Get any matches and merge with previously found comments.
			todos[ i ].path = currentDocument.file.fullPath;
			todos[ i ].file = currentDocument.file.fullPath.replace( /^.*[\\\/]/ , '' );
			todos[ i ].todos = documentTodos;
			todos[ i ].visible = fileVisible( todos[ i ].path );
		} else if ( index > -1 ) {
			todos.splice( i, 1 );
		}
	}
	
	/**
	 * Go through passed in document and search for matches.
	 */
	function parseText( currentDocument ) {
		var documentText,
			documentLines,
			matchArray,
			documentTodos = [];
		
		// Check for open documents.
		if ( currentDocument !== null && typeof( currentDocument ) !== 'string' ) {
			documentText = currentDocument.getText();
			documentLines = StringUtils.getLines( documentText );
			
			// Go through each match in current document.
			while ( ( matchArray = expression.exec( documentText ) ) != null ) {
				// Add match to array.
				documentTodos.push( {
					todo: matchArray[ 2 ].replace( doneRegExp, '' ),
					tag: matchArray[ 1 ].replace( ' ', '' ).toLowerCase(),
					line: StringUtils.offsetToLineNum( documentLines, matchArray.index ) + 1,
					char: matchArray.index - documentText.lastIndexOf( '\n' , matchArray.index ) - 1,
					done: doneRegExp.test( matchArray[ 2 ] )
				} );
			}
		}
		
		// Return found comments.
		return documentTodos;
	}
	
	/** 
	 * Take found todos and add them to panel. 
	 */
	function printTodo() {
		var resultsHTML = Mustache.render( todoResultsTemplate, {
			project: ( settings.search.scope === 'project' ? true : false ),
			todos: renderTodo()
		} );
		
		resultsHTML = $( resultsHTML );
		
		$( '.file.collapsed', resultsHTML )
			.nextUntil( '.file' ).hide();
		
		// Empty container element and apply results template.
		$todoPanel.find( '.table-container' )
			.empty()
			.append( resultsHTML );
	}
	
	/** 
	 * Render HTML for each file row. 
	 */
	function renderTodo() {
		var resultsHTML = resultsHTML = Mustache.render( todoRowTemplate, {
			files: todos
		} );
		
		return resultsHTML;
	}
	
	/**
	 * Listen for save or refresh and look for todos when needed.
	 */
	function setupRegExp() {
		// Setup regular expression.
		expression = new RegExp(
			settings.regex.prefix + settings.tags.join( '|' ) + settings.regex.suffix,
			'g' + ( settings.case !== false ? '' : 'i' )
		);
	}
	
	/**
	 * Return if file should be expanded or not.
	 */
	function fileVisible( path ) {
		return ( settings.search.scope === 'project' ? visible.indexOf( path ) > -1 : true );
	}
	
	/**
	 * Toggle if file should be expanded or not.
	 */
	function toggleFileVisible( path, state ) {
		var alreadyVisible = fileVisible( path );
		
		// Check if already visible if visibility not provided as parameter.
		state = ( state == 'undefined' ? !alreadyVisible : state );
		
		// Toggle visibility state.
		if ( state ) {
			// Show if already visible.
			if ( !alreadyVisible ) {
				visible.push( path );
			}
		} else {
			// Hide if already visible.
			if ( alreadyVisible ) {
				visible.splice( visible.indexOf( path ), 1 );
			}
		}
		
		// Save visibility state.
		preferences.setValue( 'visible', visible );
	}
	
	/**
	 * Listen for save or refresh and look for todos when needed.
	 */
	function listeners() {
		var $documentManager = $( DocumentManager ),
			$projectManager = $( ProjectManager );
		
		// Reparse files if document is saved or refreshed.
		$documentManager
			.on( 'documentSaved.todo', function( event, document ) {
				// Reload settings if .todo of current project was updated.
				if ( document.file.fullPath === ProjectManager.getProjectRoot().fullPath + '.todo' ) {
					loadSettings( function() {
						// Setup regular expression.
						setupRegExp();
						
						// Reparse all files.
						run();
					} );
				}
				
				// Reparse current file.
				if ( document === DocumentManager.getCurrentDocument() ) {
					parseFile( document );
					printTodo();
				}
			} )
			.on( 'currentDocumentChange.todo', function( event ) {
				var currentDocument = DocumentManager.getCurrentDocument(),
					$scrollTarget;
				
				// Bail if no files are open.
				if ( !currentDocument ) {
					return;
				}
				
				// No need to do anything if scope is project.
				if ( settings.search.scope !== 'project' ) {
					// Empty stored todos and parse current document.
					todos = [];
					parseFile( currentDocument );
					printTodo();
				} else {
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
				}
			} )
			.on( 'fileNameChange.todo', function( event, oldName, newName ) {
				var todoPath = ProjectManager.getProjectRoot().fullPath + '.todo';
				
				// Reload settings if .todo of current project was updated.
				if ( newName === todoPath || oldName === todoPath ) {
					loadSettings( function() {
						// Setup regular expression.
						setupRegExp();
						
						// Reparse all files.
						run();
					} );
				} else {
					// Move visibility state to new file.
					toggleFileVisible( newName, fileVisible( oldName ) );
					toggleFileVisible( oldName, false );
					
					// If not .todo, parse all files.
					run();
				}
			} )
			.on( 'pathDeleted.todo', function( event, document ) {
				// Remove file from visibility list.
				toggleFileVisible( document, false );
				
				// Parse path that was deleted to remove from list.
				parseFile( document );
				printTodo();
			} );
		
		// Reload settings when new project is loaded.
		$projectManager.on( 'projectOpen.todo', function( event, projectRoot ) {
			loadSettings( function() {
				// Setup regular expression from settings.
				setupRegExp();
				
				// Reset file visibility.
				visible = [];
				
				// Parse all files in project.
				run();
			} );
		} );
	}
	
	// Register extension.
	CommandManager.register( MENU_NAME, COMMAND_ID, toggleTodo );
	
	// Add command to menu.
	var menu = Menus.getMenu( Menus.AppMenuBar.VIEW_MENU );
	menu.addMenuDivider();
	menu.addMenuItem( COMMAND_ID, 'Ctrl-Alt-T' );
	
	// Initialize PreferenceStorage.
	preferences = PreferencesManager.getPreferenceStorage( module, defaultPreferences );
	
	// Register panel and setup event listeners.
	AppInit.appReady( function() {
		var todoHTML = Mustache.render( todoPanelTemplate, { todo: todoFile } ),
			todoPanel = PanelManager.createBottomPanel( 'mikaeljorhult.bracketsTodo.panel', $( todoHTML ), 100 );
		
		// Load stylesheet.
		ExtensionUtils.loadStyleSheet( module, 'todo.css' );
		
		// Cache todo panel.
		$todoPanel = $( '#brackets-todo' );
		
		// Close panel when close button is clicked.
		$todoPanel
			.on( 'click', '.close', function() {
				enableTodo( false );
			} )
			.on( 'click', '.indicator', function() {
				// Open file that todo originate from.
				CommandManager.execute( Commands.FILE_OPEN, { fullPath: ProjectManager.getProjectRoot().fullPath + '.todo' } ).done( function( currentDocument ) {
					// Set focus on editor.
					EditorManager.focusEditor();
				} );
			} )
			.on( 'click', '.file', function( e ) {
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
			.on( 'click', '.comment', function( e ) {
				var $this = $( this );
				
				// Open file that todo originate from.
				CommandManager.execute( Commands.FILE_OPEN, { fullPath: $this.data( 'file' ) } ).done( function( currentDocument ) {
					// Set cursor position at start of todo.
					EditorManager.getCurrentFullEditor()
						.setCursorPos( $this.data( 'line' ) - 1, $this.data( 'char' ) );
					
					// Set focus on editor.
					EditorManager.focusEditor();
				} );
			} )
			.on( 'click', '.actions-resolve', function( e ) {
				var $this = $( this ),
					$parent = $this.parents( 'tr' ),
					message = $parent.find( '.message' ).html();
				
				// Open and focus the file.
				CommandManager.execute( Commands.FILE_OPEN, { fullPath: $parent.data( 'file' ) } ).done( function( currentDocument ) {
					var editorDocument = EditorManager.getCurrentFullEditor();
					
					// Find task in file.
					
					
					// Set focus on editor.
					EditorManager.focusEditor();
					
					// Add done styling.
					$parent.toggleClass( 'done' );
				} );
			} )
			.on( 'click', '.actions-remove', function( e ) {
				var $this = $( this );
				
			} );
		
		// Add icon to toolbar.
		$todoIcon = $( '<a href="#" title="Todo" id="brackets-todo-icon"></a>' );
		
		$todoIcon
			.click( function( e ) {
				CommandManager.execute( COMMAND_ID );
			} )
			.appendTo( '#main-toolbar .buttons' );
		
		// Get saved visibility state.
		visible = preferences.getValue( 'visible' );
		
		// Enable extension if loaded last time.
		if ( preferences.getValue( 'enabled' ) ) {
			enableTodo( true );
		}
	} );
} );