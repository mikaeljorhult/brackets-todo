# Brackets Todo Changelog
All notable changes to this project will be documented in this file.

## 0.9.2 - 2017-05-15
* Add buttons for collapsing and expanding all files.
* Fix error if file was opened from last session.

## 0.9.1 - 2017-05-11
* Fix error when all files were closed.

## 0.9.0 - 2017-05-10
* Use React for rendering interface.
* ESLint and Travis CI for linting code.
* Swedish extension description.
* Remove links to GitHub mentions and issues.

## 0.8.2 - 2017-04-01
* Use Mustache module instead of deprecated global object.
* Turkish translation. Thanks to Nazim Can Altinova (@canaltinova).

## 0.8.1 - 2015-04-05
* Use Brackets internal events dispatcher. Thanks to Pete Nykänen (@petetnt).
* Use new MainViewManager for file change listeners. Thanks to Pete Nykänen (@petetnt).
* Update to German translation. Thanks to Sebastian Herrmann (@herrherrmann).

## 0.8.0 - 2014-10-11
* Support for dark themes.
* Attach labels to each comment.
* Use new split view methods when opening files.

## 0.7.1 - 2014-09-04
* Strip HTML from comments to avoid pontentially harmful code.
* Russian translation. Thanks to Dis Shishkov (@disshishkov).
* Update to french translation. Thanks to rainje (@rainje).

## 0.7.0 - 2014-09-03
* Allow modifying tag colors.
* Allow sorting by done status.
* Recognize and link to GitHub issues and mentions.
* Ukrainian translation. Thanks to Maks Lyashuk (@probil).
* Update to italian translation. Thanks to Denisov21 (@Denisov21).

## 0.6.0 - 2014-08-17
* Allow modifying default settings through new settings dialog. Thanks to Wei Lin (@anzhihun).
* Italian translation. Thanks to Fez Vrasta (@FezVrasta).
* French translation. Thanks to Cyrakuse (@cyrakuse).
* Spanish translation. Thanks to Iván Barcia (@ivarcia).
* Galician translation. Thanks to Iván Barcia (@ivarcia).

## 0.5.3 - 2014-04-02
* Ignore binary files, images and unknown files to speed up performance.

## 0.5.2 - 2014-03-24
* Use new preferences system.

## 0.5.1 - 2014-02-12
* Fix file name issue on Linux.
* German translation. Thanks to Marcel Gerber (@SAPlayer).

## 0.5.0 - 2014-01-29
* Comments with #-syntax is now recognized.
* FUTURE tag is now recognized by default.
* Functionality is broken down into smaller modules.
* Main functionality is now unit tested.
* .todo file can be created automatically if not available.
* New icon for indicating use of .todo file.
* Support for localization.
* Chinese translation. Thanks to Wei Lin (@anzhihun).
* Filtering by tag name. Thanks to Wei Lin (@anzhihun).
* Editor now centers on task when clicked in pane. Thanks to Wei Lin (@anzhihun).
* Toolbar icons to expand and collapse all files at once. Thanks to Wei Lin (@anzhihun).
* Several updates to read me and examples. Thanks to Wei Lin (@anzhihun).

## 0.4.0 - 2013-11-16
* Use new filesystem API.
* Pane enabled state is now remembered.
* File visibility state is now remembered.
* More efficient searches, especially for project scope.
* Files and folders can be excluded from search.
* Tasks can now be marked as done.
* Panel toolbar now contains indicator when .todo file is used.
* Panel scrolls to current open file when in project scope.
* Extension can be toggled by toolbar icon.
* At signs are now recognized and allowed by default. Thanks to John Blackbourn (@johnbillion).

## 0.3.0
* Scope of search can be set to currently open document or entire project.
* Option for case sensitive searches.

## 0.2.0
* Default settings, including regular expression used and tags, can be customized by adding a .todo file in your project root.
* Colon after tags are now optional to allow easier customization of comment syntax.
* TODO, FIXME, NOTE and CHANGES tags have colors for an improved experience and easier navigation. Thanks to António Pinto (@apintocr).

## 0.1.2
* Initial release.