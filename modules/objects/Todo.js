define( function( require ) {
	'use strict';
	
	// Extension modules.
	var Events = require( 'modules/Events' ),
		Settings = require( 'modules/Settings' ),
		Tags = require( 'modules/Tags' ),
		
		// Variables.
		doneRegExp = /^\[x\]/i,
		issueRegExp = /#(\d+)/i,
		mentionRegExp = /@([\w|-]+)/i,
		labelRegExp = /--([\w|-]+)/gi;
	
	// Define todo object.
	function Todo( todo ) {
		var todoObject = this;
		
		// Array of labels.
		this._labels = [];
		
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
		Events.subscribe( 'tags:visible', function( hiddenTags ) {
			todoObject._handleVisibility( hiddenTags )
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
		// Return comment if no new comment is supplied.
		if ( comment === undefined ) {
			return this._comment;
		}
		// Set comment if one is supplied.
		this._comment = this.processComment( comment );
		
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
	
	// Methods handling labels.
	Todo.prototype.labels = function() {
		// Return array of labels.
		return this._labels;
	}
	
	Todo.prototype.addLabel = function( label ) {
		// Add label to array.
		this._labels.push( label );
	}
	
	// Processing methods.
	Todo.prototype.processComment = function( comment ) {
		// Remove done status.
		comment = comment.replace( doneRegExp, '' );
		
		// Strip potentially harmful HTML.
		comment = this._stripHTML( comment );
		
		// Link mentions and issues.
		comment = this._processGithub( comment );
		
		// Extract labels.
		comment = this._processLabels( comment );
		
		// Return processed comment.
		return comment;
	}
	
	Todo.prototype._stripHTML = function( comment ) {
		// Create container element.
		var container = document.createElement( 'div' );
		
		// Parse the comment through HTML output.
		container.innerHTML = comment;
		
		// Return the output in the container as text.
		return container.textContent || container.innerText;
	}
	
	Todo.prototype._processGithub = function( comment ) {
		var github = Settings.get().github;
		
		// Check if GitHub information is specified in settings.
		if ( github !== undefined ) {
			// Link mentions to user profile on GitHub.
			comment = comment.replace( 
				mentionRegExp,
				'<a rel="external" data-href="https://github.com/$1">$&</a>'
			);
			
			// Make sure that both user and repository is specified in settings.
			if ( github.user !== undefined && github.repository !== undefined ) {
				// Link to issues on GitHub.
				comment = comment.replace(
					issueRegExp,
					'<a rel="external" data-href="https://github.com/{{ github.user }}/{{ github.repository }}/issues/$1">$&</a>'
						.replace( '{{ github.user }}', github.user )
						.replace( '{{ github.repository }}', github.repository )
				);
			}
		}
		
		return comment;
	}
	
	Todo.prototype._processLabels = function( comment ) {
		var matchArray;
		
		// Go through each matched label.
		while ( ( matchArray = labelRegExp.exec( comment ) ) !== null ) {
			// Add match to array of labels.
			this.addLabel( matchArray[ 1 ] );
		}
		
		// Remove all labels from comment.
		comment = comment.replace( labelRegExp, '' );
		
		return comment;
	}
	
	// Listeners.
	Todo.prototype._handleVisibility = function( hiddenTags ) {
		this.isVisible( hiddenTags.indexOf( this.tag() ) === -1 );
	}
	
	// Return object.
	return Todo;
} );