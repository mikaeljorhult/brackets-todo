define( function( require ) {
	'use strict';
	
	// Get dependencies.
	var StringUtils = brackets.getModule( 'utils/StringUtils' ),
		
		// Extension modules.
		Files = require( 'modules/Files' ),
		Todo = require( 'modules/objects/Todo' ),
		
		// Variables.
		expression;
	
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
				if ( todos[ i ].path() === fileToMatch ) {
					// File found in array, store index.
					index = i;
					break;
				}
			}
			
			// Add file to array if any comments is found.
			if ( documentTodos.length > 0 ) {
				// Create object for new entry in array if none found.
				if ( index === -1 ) {
					todos.push( new Files.create() );
					index = length;
				}
				
				// Get any matches and merge with previously found comments.
				todos[ index ].path( currentDocument.file.fullPath );
				todos[ index ].todos( documentTodos );
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
				documentTodos.push( new Todo( {
					comment: matchArray[ 2 ],
					tag: matchArray[ 1 ],
					line: StringUtils.offsetToLineNum( lines, matchArray.index ) + 1,
					char: matchArray.index - text.lastIndexOf( '\n' , matchArray.index ) - 1,
				} ) );
			}
		}
		
		// Return found comments.
		return documentTodos;
	}
	
	/**
	 * Remove file from array.
	 */
	function removeFile( path, todos ) {
		var index = getIndex( path, todos );
		
		// Remove file if found in array.
		if ( index > -1 ) {
			todos.splice( index, 1 );
		}
		
		return todos;
	}
	
	/**
	 * Determine and return index of path in todo array.
	 */
	function getIndex( path, todos ) {
		var index = -1,
			i,
			length;
		
		// Check if file has already been added to array.
		for ( i = 0, length = todos.length; i < length; i++ ) {
			if ( todos[ i ].path() === path ) {
				// File found in array, store index.
				index = i;
				break;
			}
		}
		
		return index;
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
	return {
		getExpression: getExpression,
		setExpression: setExpression,
		parseFile: parseFile,
		parseText: parseText,
		removeFile: removeFile
	};
} );