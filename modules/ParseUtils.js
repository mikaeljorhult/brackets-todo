define( function( require, exports ) {
	'use strict';
	
	// Get dependencies.
	var StringUtils = brackets.getModule( 'utils/StringUtils' ),
		
		// Variables.
		expression,
		done = /^\[x\]/i;
	
	/**
	 * Pass file to parsing function.
	 */
	function parseFile( currentDocument, todos ) {
		var documentTodos = [],
			index = -1,
			fileToMatch,
			text,
			i,
			length;
		
		if ( currentDocument !== null && typeof( currentDocument ) !== 'string' ) {
			// Get information about current file.
			fileToMatch = currentDocument.file.fullPath;
			text = currentDocument.getText();
			
			// Parse document.
			documentTodos = parseText( text, StringUtils.getLines( text ) );
			
			// Check if file has already been added to array.
			for ( i = 0, length = todos.length; i < length; i++ ) {
				if ( todos[ i ].path === fileToMatch ) {
					// File found in array, store index.
					index = i;
					break;
				}
			}
			
			// Add file to array if any comments is found.
			if ( documentTodos.length > 0 ) {
				// Create object for new entry in array if none found.
				if ( index === -1 ) {
					todos.push( {} );
					index = length;
				}
				
				// Get any matches and merge with previously found comments.
				todos[ index ].path = currentDocument.file.fullPath;
				todos[ index ].file = currentDocument.file.fullPath.replace( /^.*[\\\/]/ , '' );
				todos[ index ].todos = documentTodos;
			} else if ( index > -1 ) {
				todos.splice( index, 1 );
			}
		}
		
		return todos;
	}
	
	/**
	 * Go through text and search for matches.
	 */
	function parseText( text, lines ) {
		var matchArray,
			documentTodos = [];
		
		if ( expression !== undefined ) {
			// Go through each match in current document.
			while ( ( matchArray = expression.exec( text ) ) !== null ) {
				// Add match to array.
				documentTodos.push( {
					todo: matchArray[ 2 ].replace( done, '' ),
					tag: matchArray[ 1 ].replace( /[^a-zA-Z]/g, '' ).toLowerCase(),
					line: StringUtils.offsetToLineNum( lines, matchArray.index ) + 1,
					char: matchArray.index - text.lastIndexOf( '\n' , matchArray.index ) - 1,
					done: done.test( matchArray[ 2 ] )
				} );
			}
		}
		
		// Return found comments.
		return documentTodos;
	}
	
	/**
	 * Get the regular epression to use in parsing.
	 */
	function getExpression() {
		return expression;
	}
	
	/**
	 * Set the regular epression to use in parsing.
	 */
	function setExpression( newExpression ) {
		expression = newExpression;
	}
	
	// Make variables accessible.
	exports.getExpression = getExpression;
	exports.setExpression = setExpression;
	exports.parseFile = parseFile;
	exports.parseText = parseText;
} );