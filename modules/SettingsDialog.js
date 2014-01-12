/* global define, brackets, Mustache, $ */

define( function ( require, exports, module ) {
	'use strict';
	
	// Get dependincies.
	var CommandManager = brackets.getModule( 'command/CommandManager' ),
		Commands = brackets.getModule( 'command/Commands' ),
		Dialogs = brackets.getModule( 'widgets/Dialogs' ),
		FileUtils = brackets.getModule( 'file/FileUtils' ),
		FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
		ProjectManager = brackets.getModule( 'project/ProjectManager' ),
		
		// Todo modules.
		Defaults = require( 'modules/Defaults' ),
		Strings = require( 'modules/strings' ),
		SettingsManager = require( 'modules/SettingsManager' ),
		Events = require( 'modules/Events' ),
		
		// Templates.
		settingsDialogTemplate = require( 'text!html/settings-dialog.html' ),
		settingsDialogHtml;
	
	/**
	 * Get prefix regular expression
	 * @return {String} prefix 
	 */
	function getPrefix() {
		return settingsDialogHtml.find( '#prefix' ).val();
	}
	
	/**
	 * Get suffix regular expression
	 * @return {String} suffix 
	 */
	function getSuffix() {
		return settingsDialogHtml.find( '#suffix' ).val();
	}
	
	/**
	 * Get search scope
	 * @return {String} 'current' or 'project' 
	 */
	function getScope() {
		return settingsDialogHtml.find( 'input[name=scope]:checked' ).val();
	}
	
	/**
	 * Split string by comma into array
	 * @return {Array} 
	 */
	function splitByComma( string ) {
		var result = [];
		
		if (string.trim().length > 0) {
			
			// Filtering empty string
			$.each( string.split( ',' ), function( index, item ) {
				if ( item.trim().length > 0 ) {
					result.push( item.trim() );
				}
			} );
		}
		
		return result;
	}
	
	/**
	 * Get exclude folders
	 * @return {Array} [] if no folders
	 */
	function getExcludeFolders() {
		return splitByComma( settingsDialogHtml.find( '#excludeFolders' ).val() );
	}
	
	/**
	 * Get exclude files
	 * @return {Array} [] if no files
	 */
	function getExcludeFiles() {
		return splitByComma( settingsDialogHtml.find( '#excludeFiles' ).val() );
	}
	
	/**
	 * Get case sensitive
	 * @return {Boolean} true if case sensitive, otherwise false
	 */
	function isCaseSensitive() {
		var select = settingsDialogHtml.find( 'input[name=case]:checked' ).val();
		return select === 'true' ? true : false;
	}
	
	/**
	 * Get selected tags
	 * @return {Array} [] if no tags
	 */
	function getSelectedTags() {
		return splitByComma( settingsDialogHtml.find( '#tags' ).val() );
	}
	
	/**
	 * Store new settings and Send settings loaded event
	 */
	function saveSettings() {
		var newSettings = {
			regex: {
				prefix: getPrefix(),
				suffix: getSuffix(),
			},
			tags: getSelectedTags(),
			case: isCaseSensitive(),
			search: {
				scope: getScope(),
				excludeFolders: getExcludeFolders(),
				excludeFiles: getExcludeFiles()
			}
		};
		SettingsManager.setGlobalSettings(newSettings);
		Events.publish( 'settings:loaded' );
	}
	
	/**
	 * Show setting dialog
	 */
	function showDialog() {
		var settings = {
				prefix: SettingsManager.getSettings().regex.prefix,
				suffix: SettingsManager.getSettings().regex.suffix,
				case: SettingsManager.getSettings().case,
				tags: SettingsManager.getSettings().tags,
				defaultTags: Defaults.defaultSettings.tags,
				currentScope: Defaults.CURRENT_SCOPE,
				projectScope: Defaults.PROJECT_SCOPE,
				isCurrentScope: !SettingsManager.isProjectScope(),
				excludeFolders: SettingsManager.getSettings().search.excludeFolders,
				excludeFiles: SettingsManager.getSettings().search.excludeFiles
			},
			dialog = Dialogs.showModalDialogUsingTemplate( Mustache.render( settingsDialogTemplate, {
				strings: Strings,
				settings: settings
			} ) );
		
		// save dialog html for getting custom settings
		settingsDialogHtml = $( '#todo-settings-dialog' );
		
		// Wait for button to be clicked.
		dialog.done( function( id ) {
			// Create file if yes was clicked.
			if ( id === 'yes' ) {
				saveSettings();
			}
		} );
	}
	
	// Make variables and functions accessible.
	exports.showDialog = showDialog;
} );