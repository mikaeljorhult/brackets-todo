define( function( require ) {
	'use strict';
	
	// Define tag object.
	function Tag( tag ) {
		// Use object properties if one was supplied.
		if ( typeof( tag ) === 'object' ) {
			this.tag( tag.tag );
			this.name( tag.name );
			this.count( tag.count );
			this.isVisible( tag.visible );
		} else {
			this._tag = '';
			this._name = '';
			this._count = 0;
			this._visibility = true;
		}
	}
	
	// Methods handling tag.
	Tag.prototype.tag = function( tag ) {
		// Return tag if no new tag is supplied.
		if ( tag === undefined ) {
			return this._tag;
		}
		
		// Set tag if one is supplied.
		this._tag = tag.replace( /[^a-zA-Z]/g, '' ).toLowerCase();
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
	
	// Methods handling count.
	Tag.prototype.count = function( count ) {
		// Return count if no new tag is supplied.
		if ( count === undefined ) {
			return this._count;
		}
		
		// Set tag if one is supplied.
		this._count = count;
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
	
	// Return object.
	return Tag;
} );