define( function( require ) {
	'use strict';
	
	// Extension modules.
	var Events = require( 'modules/Events' ),
		
		// Variables.
		defaultColors = {
			default: '#555',
			fixme: '#c95353',
			future: '#5a99c3',
			note: '#696',
			todo: '#d95',
		};
	
	// Define tag object.
	function Tag( tag ) {
		var tagObject = this;
		
		// Use object properties if one was supplied.
		if ( typeof( tag ) === 'object' ) {
			this.tag( tag.tag );
			this.name( tag.name );
			this.color( tag.color );
			this.count( tag.count );
			this.isVisible( tag.visible );
		} else {
			this._tag = '';
			this._regexp = '';
			this._name = '';
			this._count = 0;
			this._visibility = true;
		}
		
		// Set color if none already set.
		if ( this._color === undefined ) {
			// Use tag color if one is defined otherwise use default.
			if ( defaultColors.hasOwnProperty( this.tag() ) ) {
				// Current tag has a default color.
				this.color( defaultColors[ this.tag() ] );
			} else {
				// Default to default color.
				this._color = defaultColors.default;
			}
		}
		
		// Subscribe to changes in tag visibility.
		Events.subscribe( 'tags:visible', function( hiddenTags ) {
			tagObject._handleVisibility( hiddenTags )
		} );
	}
	
	// Methods handling tag.
	Tag.prototype.tag = function( tag ) {
		var parts;
		
		// Return tag if no new tag is supplied.
		if ( tag === undefined ) {
			return this._tag;
		}
		
		// Check if tag contains color.
		parts = tag.split( ':', 2 );
		
		// Set color if one was found.
		if ( parts.length > 1 ) {
			this.color( parts[ 1 ] );
		}
		
		// Set tag RegExp.
		this._regexp = parts[ 0 ];
		
		// Set tag if one is supplied.
		this._tag = parts[ 0 ].replace( /[^a-zA-Z]/g, '' ).toLowerCase();
	}
	
	// Methods handling name.
	Tag.prototype.name = function( name ) {
		// Return name if no new tag is supplied.
		if ( name === undefined ) {
			return this._name;
		}
		
		// Set tag if one is supplied.
		this._name = name.replace( /[^a-zA-Z]/g, '' );
	}
	
	Tag.prototype.regexp = function( regexp ) {
		// Return name if no new tag is supplied.
		if ( regexp === undefined ) {
			return this._regexp;
		}
		
		// Set tag if one is supplied.
		this._regexp = regexp;
	}
	
	// Methods handling count.
	Tag.prototype.count = function( count ) {
		// Return count if no count is supplied.
		if ( count === undefined ) {
			return this._count;
		}
		
		// Set count if one is supplied.
		this._count = count;
	}
	
	// Methods handling color.
	Tag.prototype.color = function( color ) {
		// Return color if no color is supplied.
		if ( color === undefined ) {
			return this._color;
		}
		
		// Set color if one is supplied and valid.
		if ( /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test( color ) ) {
			this._color = color;
		}
	}
	
	// Methods handling visibility.
	Tag.prototype.isVisible = function( visibility ) {
		// Return count if no new tag is supplied.
		if ( visibility === undefined ) {
			return this._visibility;
		}
		
		// Set tag if one is supplied.
		this._visibility = visibility;
	}
	
	// Listeners.
	Tag.prototype._handleVisibility = function( hiddenTags ) {
		this.isVisible( hiddenTags.indexOf( this.tag() ) === -1 );
	}
	
	// Return object.
	return Tag;
} );