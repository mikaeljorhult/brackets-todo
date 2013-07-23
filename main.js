/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/** Brackets Todos Extension 
    description 
*/
define(function (require, exports, module) {
    'use strict';
    
    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus"),
        DocumentManager = brackets.getModule("document/DocumentManager");
    //var EditorManager  = brackets.getModule("editor/EditorManager");
    //var ProjectManager = brackets.getModule("project/ProjectManager");
    //var FileUtils = brackets.getModule("file/FileUtils");
    //var NativeApp = brackets.getModule("utils/NativeApp");
    //var Commands = brackets.getModule("command/Commands");
    
    var COMMAND_ID = "mikaeljorhult.bracketsTodo.parseTodo",
        MENU_NAME = "Todo",
        regex = {
            prefix: "(?:\/\*\s*|\/\/\s*)(",
            suffix: "):\ *.*(?=\n+)",
            keywords: [ "TODO", "NOTE", "FIX\s?ME", "CHANGES" ]
        };
    
    /** Annotation 
        description 
	*/
    function parseTodo() {
        var currentDoc = DocumentManager.getCurrentDocument(),
            documentText,
            expression,
            todos;
        
        // Check for open documents.
        if (currentDoc !== null) {
            expression = new RegExp(regex.prefix + regex.keywords.join("|") + regex.suffix, "gi");
            documentText = currentDoc.getText();
            todos = documentText.match(expression);
            
            // Go through each todo.
            todos.forEach(function (value, index) {
                console.log(value);
            });
        }
    }
    
    // Register extension.
    CommandManager.register(MENU_NAME, COMMAND_ID, parseTodo);
    
    // Add command to menu.
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(COMMAND_ID, "Ctrl-Alt-T");
});