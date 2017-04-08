define(function (require) {
  'use strict';

  var Todo = require('modules/objects/Todo');

  /**
   * Go through text and search for matches.
   */
  function parse (text, expression) {
    var matches;
    var todos = [];

    // Go through each match in current document.
    while ((matches = expression.exec(text)) !== null) {
      // Add match to array.
      todos.push(new Todo({
        comment: matches[2],
        tag: matches[1],
        line: text.substr(0, matches.index).split('\n').length,
        char: matches.index - text.lastIndexOf('\n', matches.index) - 1
      }));
    }

    // Return found comments.
    return todos;
  }

  // Make variables accessible.
  return {
    parse: parse
  };
});
