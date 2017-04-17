define(function () {
  'use strict';

  // Variables.
  var doneRegExp = /^\[x\]/i;

  /**
   * Go through text and search for matches.
   */
  function parse (text, expression, path) {
    var matches;
    var todos = [];

    // Go through each match in current document.
    while ((matches = expression.exec(text)) !== null) {
      // Construct basic object.
      var todo = {
        tag: matches[1],
        comment: matches[2],
        line: text.substr(0, matches.index).split('\n').length,
        char: matches.index - text.lastIndexOf('\n', matches.index) - 1,
        path: path
      };

      // Assign key based on file name as well as line and column numbers.
      todo.key = path + ':' + todo.line + ':' + todo.char;

      // Set done status and remove it from comment text.
      todo.done = doneRegExp.test(todo.comment);
      todo.comment = todo.comment.replace(doneRegExp, '');

      // Add match to array.
      todos.push(todo);
    }

    // Return found comments.
    return todos;
  }

  // Make variables accessible.
  return {
    parse: parse
  };
});
