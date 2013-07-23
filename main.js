/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/** Brackets Todos Extension 
	description 
*/
define( function( require, exports, module ) {
	'use strict';
	
	var CommandManager = brackets.getModule( 'command/CommandManager' ),
		Menus = brackets.getModule( 'command/Menus' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' );
	//var EditorManager  = brackets.getModule("editor/EditorManager");
	//var ProjectManager = brackets.getModule("project/ProjectManager");
	//var FileUtils = brackets.getModule("file/FileUtils");
	//var NativeApp = brackets.getModule("utils/NativeApp");
	//var Commands = brackets.getModule("command/Commands");
	
	var COMMAND_ID  = 'mikaeljorhult.bracketsTodo.parseTodo'; 
	var MENU_NAME   = 'Todo';
	
	CommandManager.register( MENU_NAME, COMMAND_ID, parseTodo );
	
	var menu = Menus.getMenu( Menus.AppMenuBar.FILE_MENU );
	menu.addMenuDivider();
	menu.addMenuItem( COMMAND_ID );
} );