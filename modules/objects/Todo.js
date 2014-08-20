define( function( require ) {
	'use strict';
	
	// Variables.
	var doneRegExp = /^\[x\]/i;
	
	// Define todo object.
	function Todo( todo ) {
		// Use object properties if one was supplied.
		if ( typeof( todo ) === 'object' ) {
			this.tag( todo.tag );
			this.comment( todo.comment );
			this.line( todo.line );
			this.char( todo.char );
		} else {
			this._tag = '';
			this._comment = '';
			this._line = '';
			this._char = '';
			this._done = false;
		}
	}
	
	// Methods handling tag.
	Todo.prototype.tag = function( tag ) {
		// Return tag if no new tag is supplied.
		if ( tag === undefined ) {
			return this._tag;
		}
		
		// Set tag if one is supplied.
		this._tag = tag.replace( /[^a-zA-Z]/g, '' ).toLowerCase();
	}
	
	// Methods handling comment.
	Todo.prototype.comment = function( comment ) {
		// Return comment if no new comment is supplied.
		if ( comment === undefined ) {
			return this._comment;
		}
		
		// Set comment if one is supplied.
		this._comment = comment.replace( doneRegExp, '' );
		
		// Check and save done status.
		this.isDone( doneRegExp.test( comment ) );
	}
	
	// Methods handling done status.
	Todo.prototype.isDone = function( done ) {
		// Return done status if no is supplied.
		if ( done === undefined ) {
			return this._done;
		}
		
		// Set done status if supplied.
		this._done = done;
	}
	
	// Methods handling position.
	Todo.prototype.line = function( line ) {
		// Return line if no is supplied.
		if ( line === undefined ) {
			return this._line;
		}
		
		// Set line if one is supplied.
		this._line = line;
	}
	
	Todo.prototype.char = function( char ) {
		// Return char if no is supplied.
		if ( char === undefined ) {
			return this._char;
		}
		
		// Set char if one is supplied.
		this._char = char;
	}
	
	// Return object.
	return Todo;
} );