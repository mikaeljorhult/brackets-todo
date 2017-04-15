define(function () {
  'use strict';

  /**
   * Go through text and search for matches.
   */
  function parse (text, expression) {
    var matches;
    var todos = [];

    // Go through each match in current document.
    while ((matches = expression.exec(text)) !== null) {
      // Add match to array.
      todos.push({
        tag: matches[1],
        comment: matches[2],
        line: text.substr(0, matches.index).split('\n').length,
        char: matches.index - text.lastIndexOf('\n', matches.index) - 1
      });
    }

    // Return found comments.
    return todos;
  }

  // Make variables accessible.
  return {
    parse: parse
  };
});
