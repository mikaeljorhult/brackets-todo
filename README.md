# Brackets Todo 0.1.1

Brackets/Edge Code extension that displays all TODO comments in current document.

## Install from URL

1. Open the the Extension Manager from the File menu.
2. Click on Install form URL...
3. Copy and paste following URL in the text field: `https://github.com/mikaeljorhult/brackets-todo`
4. Click Install.


## Install from file system

1. Download this extension using the ZIP button and unzip it.
2. Copy it in Brackets' `/extensions/user` folder by selecting Show Extension Folder in the Help menu. 
3. Reload Brackets.


## Instructions

Go to the View menu and click on Todo to enable the extension. A panel will be displayed in the bottom of 
the Brackets window displaying all TODO comments within the document in a list.

Clicking on one of the comments in the list will move the cursor to that point in the document.


## Comment Syntax

Todo will recognize C-style comments using the [tags](http://en.wikipedia.org/wiki/Comment_%28computer_programming%29#Tags)
`TODO`, `NOTE`, `FIXME` or `CHANGES` followed by a colon as shown in examples below.

Please note that multiline comments will not work. Todo will only return the first line of the comment.

`
// TODO: This is a comment.
`

`
/* NOTE: This is a comment. */
`