/*!
 * Brackets Todo 0.3.1
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
		FileIndexManager = brackets.getModule( 'project/FileIndexManager' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		PanelManager = brackets.getModule( 'view/PanelManager' ),
		Resizer = brackets.getModule( 'utils/Resizer' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		FileUtils = brackets.getModule( 'file/FileUtils' ),
		NativeFileSystem = brackets.getModule( 'file/NativeFileSystem' ).NativeFileSystem,
		StringUtils = brackets.getModule( 'utils/StringUtils' ),
		ExtensionUtils = brackets.getModule( 'utils/ExtensionUtils' ),
		todoPanelTemplate = require( 'text!html/panel.html' ),
		todoResultsTemplate = require( 'text!html/results.html' );
	
	// Setup extension.
	var COMMAND_ID = 'mikaeljorhult.bracketsTodo.enable',
		MENU_NAME = 'Todo',
		preferences = null,
		defaultPreferences = {
			enabled: false
		},
		todos = [],
		expression,
		$todoPanel,
		doneRegExp = /^\[x\]/i,
		defaultSettings = {
			regex: {
				prefix: '(?:\\/\\*|\\/\\/) *(',
				suffix: '):? *(.*?) ?(?=\\*/|\\n|$)',
			},
			tags: [ 'TODO', 'NOTE', 'FIX ?ME', 'CHANGES' ],
			case: false,
			search: {
				scope: 'current'
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
		} else {
			// Hide panel.
			Resizer.hide( $todoPanel );
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
			fileEntry = new NativeFileSystem.FileEntry( projectRoot.fullPath + '.todo' ),
			fileContent = FileUtils.readAsText( fileEntry ),
			userSettings = {};
		
		// File is loaded asynchronous.
		fileContent.done( function( content ) {
			// Catch error if JSON is invalid
			try {
				// Parse .todo file.
				userSettings = JSON.parse( content );
			} catch ( e ) {
				// .todo exists but isn't valid JSON.
			}
			
			// Merge default settings with JSON.
			settings = jQuery.extend( {}, defaultSettings, userSettings );
			
			// Trigger callback when done.
			callback();
		} ).fail( function( error ) {
			// .todo doesn't exists or couldn't be accessed.
			settings = defaultSettings;
			
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
			FileIndexManager.getFileInfoList( 'all' ).done( function( fileListResult ) {
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
	 * Pass file to parsing function.
	 */
	function parseFile( currentDocument ) {
		var documentTodos = parseText( currentDocument );
		
		// Add file to array if any comments is found.
		if ( documentTodos.length > 0 ) {
			// Get any matches and merge with previously found comments.
			todos.push( {
				path: currentDocument.file.fullPath,
				file: currentDocument.file.fullPath.replace( /^.*[\\\/]/ , '' ),
				todos: documentTodos
			} );
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
		if ( currentDocument !== null ) {
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
			results: todos
		} );
		
		// Empty container element and apply results template.
		$todoPanel.find( '.table-container' )
			.empty()
			.append( resultsHTML );
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
	 * Listen for save or refresh and look for todos when needed.
	 */
	function listeners() {
		var $documentManager = $( DocumentManager ),
			$projectManager = $( ProjectManager );
		
		// Reparse files if document is saved or refreshed.
		$documentManager.on( 'documentSaved.todo', function( event, document ) {
			// Reload settings if .todo of current project was updated.
			if ( document.file.fullPath === ProjectManager.getProjectRoot().fullPath + '.todo' ) {
				loadSettings( function() {
					// Setup regular expression.
					setupRegExp();
				} );
			}
			
			// Reparse files if document is saved or refreshed.
			if ( document === DocumentManager.getCurrentDocument() ) {
				run();
			}
		} );
		
		// No need to reparse files if all files already is parsed (scope is project).
		if ( settings.search.scope !== 'project' ) {
			$documentManager.on( 'documentSaved.todo documentRefreshed.todo', function( event, document ) {
				if ( document === DocumentManager.getCurrentDocument() ) {
					run();
				}
			} ).on( 'currentDocumentChange.todo', function() {
				run();
			} );
		}
		
		// Reload settings when new project is loaded.
		$projectManager.on( 'projectOpen', function( event, projectRoot ) {
			loadSettings( function() {
				// Setup regular expression from settings.
				setupRegExp();
				
				// Call parsing function.
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
		var todoHTML = Mustache.render( todoPanelTemplate, {} ),
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
			.on( 'click', '.file', function( e ) {
				// Change classes and toggle visibility of todos.
				$( this )
					.toggleClass( 'expanded' )
					.toggleClass( 'collapsed' )
					.nextUntil( '.file' )
						.toggle();
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
			} );
		
		// Enable extension if loaded last time.
		if ( preferences.getValue( 'enabled' ) ) {
			enableTodo( true );
		}
	} );
} );