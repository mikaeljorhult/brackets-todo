define( function( require ) {
	'use strict';
	
	// Get dependencies.
	var ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		
		// Extension modules.
		Paths = require( 'modules/Paths' ),
		SettingsManager = require( 'modules/SettingsManager' );
	
	// Define file object.
	function File( file ) {
		// Use object properties if one was supplied.
		if ( typeof( file ) === 'object' ) {
			this._name = file.name;
			this._path = file.path;
			this._todos = file.todos;
		} else {
			this._name = '';
			this._path = '';
			this._todos = [];
		}
	}
	
	// Methods handling file name.
	File.prototype.name = function( name ) {
		// Return file name if no new name is supplied.
		if ( name === undefined ) {
			return this._name;
		}
		
		// Set file name if one is supplied.
		this._name = name;
	}
	
	File.prototype.path = function( path ) {
		// Return path if no new name is supplied.
		if ( path === undefined ) {
			return this._path;
		}
		
		// Set path if one is supplied.
		this._path = path;
		
		// Set file name relative to project root.
		this._name = Paths.makeRelative( path );
	}
	
	// Methods handling todos.
	File.prototype.todos = function( todos ) {
		// Return path if no new name is supplied.
		if ( todos === undefined ) {
			return this._todos;
		}
		
		// Set todos if supplied.
		this._todos = todos;
	}
	
	File.prototype.addTodo = function( todo ) {
		this._todos.push( todo );
	}
	
	File.prototype.clearTodos = function() {
		this._todos = [];
	}
	
	File.prototype.hasVisibleTodos = function() {
		var todo;
		
		// Do not return if file has no todos.
		if ( this._todos.length < 1 ) {
			return false;
		}
		
		// Go through each comment and only return those of visible tags.
		for ( todo in this._todos ) {
			if ( SettingsManager.isTagVisible( this._todos[ todo ].tag() ) ) {
				return true;
			}
		}
		
		// Check if file has any visible todos after filtering.
		return false;
	}
	
	// Return object.
	return File;
} );