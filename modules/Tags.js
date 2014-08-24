define( function( require ) {
	'use strict';
	
	// Extension modules.
	var Events = require( 'modules/Events' ),
		Tag = require( 'modules/objects/Tag' ),
		
		// Variables.
		preferences,
		tags = [];
	
	/**
	 * Initialize tags by building array of tag objects.
	 */
	function init( newTags, prefs ) {
		// Cache preferences object.
		preferences = prefs;
		
		// Remove all tags before adding new ones.
		tags = [];
		
		// Build an array of possible tags.
		$.each( newTags, function( index, tag ) {
			var newTag = {
				count: 0,
				visible: true
			};
			
			// Check if tag is an object or string.
			if ( typeof( tag ) === 'object' ) {
				// Get tag and color from object.
				newTag = {
					tag: tag.name,
					name: cleanTagName( tag.name ),
					color: tag.color
				};
			} else {
				// Use string value as tag and name.
				newTag = {
					tag: tag,
					name: cleanTagName( tag ),
				};
			}
			
			// Add tag to array af tags.
			tags.push( create( newTag ) );
		} );
	}
	
	/**
	 * Create tag from object.
	 */
	function create( tag ) {
		var hiddenTags = preferences.get( 'hiddenTags' ),
			newTag = new Tag( tag );
		
		// Set visibility state for tag.
		newTag.isVisible( hiddenTags.indexOf( newTag.tag() ) === -1 );
		
		// Return created tag.
		return newTag;
	}
	
	/**
	 * Return array of all available tags.
	 */
	function getAll( onlyNames ) {
		// Return only names if requested.
		if ( onlyNames === true ) {
			// Return array of only tags of tags array.
			return tags.map( function( tag ) {
				return tag.tag();
			} );
		}
		
		// Return tags as objects.
		return tags;
	}
	
	/**
	 * Return array of all hidden tags.
	 */
	function getHidden( onlyNames ) {
		return getFiltered( false, onlyNames );
	}
	
	/**
	 * Return array of all visible tags.
	 */
	function getVisible( onlyNames ) {
		return getFiltered( true, onlyNames );
	}
	
	/**
	 * Return array of all available tags filtered by visibility.
	 */
	function getFiltered( visible, onlyNames ) {
		var filteredTags;
		
		// Default to returning only visible tags.
		visible = ( visible !== undefined ? visible : true );
		
		// Filter array of tags according to tag visibility.
		filteredTags = tags.filter( function( tag ) {
			return tag.isVisible() === visible;
		} );
		
		// Return only names if requested.
		if ( onlyNames === true ) {
			// Return array of only tags of tags array.
			return filteredTags.map( function( tag ) {
				return tag.tag();
			} );
		}
		
		// Return filtered array.
		return filteredTags;
	}
	
	/**
	 * Check if a tag is visible.
	 */
	function isVisible( tagName ) {
		var tag;
		
		// Go through all tags to find requested one.
		for ( tag in tags ) {
			// Return visibility state of tag if found in array.
			if ( tags[ tag ].tag() === cleanTagName( tagName ) ) {
				return tags[ tag ].isVisible();
			}
		}
		
		// Tag was not found.
		return false;
	}
	
	/**
	 * Toggle visibility state of tag.
	 */
	function toggleVisible( tagName, visible ) {
		var shouldBeVisible = ( visible !== undefined ? visible : !isVisible( cleanTagName( tagName ) ) ),
			hiddenTags;
		
		// Go through all tags to find requested one.
		$.each( tags, function( index, tag ) {
			
			// Set visibility state of tag if found in array.
			if ( tag.tag() === tagName ) {
				tag.isVisible( shouldBeVisible );
			}
		} );
		
		// Get tags of all visible tags.
		hiddenTags = getHidden( true );
		
		// Trigger event for changed visibility.
		Events.publish( 'tags:visible', [ hiddenTags ] );
		
		// Save array of hidden tags in current project.
		preferences.set( 'hiddenTags', hiddenTags, { location: { scope: 'project' } } );
		preferences.save();
	}
	
	/**
	 * Get color of a tag.
	 */
	function getColor( tagName ) {
		var tag;
		
		// Go through all tags to find requested one.
		for ( tag in tags ) {
			// Return visibility state of tag if found in array.
			if ( tags[ tag ].tag() === cleanTagName( tagName ) ) {
				return tags[ tag ].color();
			}
		}
		
		// Tag was not found.
		return false;
	}
	
	/**
	 * Clean tag name for comparisons.
	 */
	function cleanTagName( name ) {
		return name.split( ':', 1 )[ 0 ].replace( /[^a-zA-Z]/g, '' ).toLowerCase();
	}
	
	// Return global methods.
	return {
		init: init,
		
		getAll: getAll,
		getHidden: getHidden,
		getVisible: getVisible,
		
		isVisible: isVisible,
		toggleVisible: toggleVisible,
		
		getColor: getColor
	};
} );