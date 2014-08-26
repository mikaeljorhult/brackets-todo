define( function( require ) {
	'use strict';
	
	// Extension modules.
	var Events = require( 'modules/Events' ),
		Settings = require( 'modules/Settings' ),
		Tags = require( 'modules/Tags' ),
		
		// Variables.
		doneRegExp = /^\[x\]/i,
		issueRegExp = /#(\d+)/i;
	
	// Define todo object.
	function Todo( todo ) {
		var todoObject = this;
		
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
		
		// Check if tag is visible.
		this.isVisible( Tags.isVisible( todo.tag ) );
		
		// Get tag color.
		this.color( Tags.getColor( todo.tag ) );
		
		// Subscribe to changes in tag visibility.
		Events.subscribe( 'tags:visible', function( visibleTags ) {
			todoObject._handleVisibility( visibleTags )
		} );
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
		var github = Settings.get().github;
		
		// Return comment if no new comment is supplied.
		if ( comment === undefined ) {
			return this._comment;
		}
		
		// Check for GitHub issues.
		if ( github !== undefined ) {
			comment = comment.replace( 
				issueRegExp,
				'<a rel="external" data-href="https://github.com/{{ github.user }}/{{ github.repository }}/issues/$1">$&</a>'
					.replace( '{{ github.user }}', github.user )
					.replace( '{{ github.repository }}', github.repository )
			);
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
	
	// Methods handling visibility.
	Todo.prototype.isVisible = function( visible ) {
		// Return visibility if it is not supplied.
		if ( visible === undefined ) {
			return this._visible;
		}
		
		// Set visibility if it is supplied.
		this._visible = visible;
	}
	
	// Methods handling color.
	Todo.prototype.color = function( color ) {
		// Return color if no color is supplied.
		if ( color === undefined ) {
			return this._color;
		}
		
		this._color = color;
	}
	
	// Listeners.
	Todo.prototype._handleVisibility = function( hiddenTags ) {
		this.isVisible( hiddenTags.indexOf( this.tag() ) === -1 );
	}
	
	// Return object.
	return Todo;
} );