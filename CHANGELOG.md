# Change Log

All notable changes to "Text Marker Custom" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.14.0] - 2026-10-25
### Added

- Edit literal text and regular expressions in one native input with Match Case, Match Whole Words and Regular Expression buttons. Open a uniquely targeted rule directly, and preserve existing rule identity and color; validate before applying and discard canceled edits.

### Changed

- Keep four editor context entries: Set Highlight, Edit Highlight Rules, Remove Selected Highlight and Clear All Highlights. The native Set Highlight submenu displays numbered entries for the first 30 configured palette colors, updates immediately and reads each color by its current index. Empty palettes hide the submenu; Ctrl+H and automatic allocation continue to use the full palette.
- Keep four effective `textmarker.commandsOnContextMenu` visibility settings, remove the six obsolete settings and the old fixed-color commands, and retain `textmarker.toggleHighlight` and the other functional command IDs.

## [1.13.0] - 2026-10-24
### Changed

- Change `textmarker.toggleHighlight` to add highlights or cycle existing rules through the configured palette, preserving rule identity and matching options. Use `textmarker.unhighlight` to remove a rule.
- Rename the command in English, Simplified Chinese and Traditional Chinese; keep command IDs and settings unchanged.
- Expand both README recommendation blocks with per-setting explanations and aligned JSONC comments. Clarify the original animations show the former toggle behavior.

## [1.12.0] - 2026-10-24
### Changed
- Use the independent `luck-gh.text-marker-custom` identity and Text Marker Custom display name.
- Add an original vector highlighter icon and a 256x256 PNG export.
- Provide Chinese and English introductions with explicit language links, recommended JSONC settings and the original MIT-licensed demonstrations.
- Retain the upstream attribution, MIT notice and existing `textmarker.*` settings and commands.
- Require the original Text Marker edition to be disabled or uninstalled to avoid command conflicts.

## [1.11.1] - 2026-10-24 (custom fork)
### Added
- Ten fixed context-menu highlight colors, preserving existing pattern options when recoloring.
- Configurable border width, style and corner radius, with immediate style refresh.
- Native English, Simplified Chinese and Traditional Chinese menus and runtime prompts.
- Isolated real-host and renderer smoke tests for all three display languages.

### Changed
- Require VS Code 1.73 or later.
- Remove extension telemetry and automatic post-publish Git tag/push actions.
- Retain the original extension ID for GitHub custom builds so existing settings and keybindings continue to work.

## [1.11.0] - 2019-04-20
### Added
- Configuration to hide status bar items. [#32](https://github.com/ryu1kn/vscode-text-marker/issues/32)

## [1.10.0] - 2018-12-17
### Added
- Colours are now saved when highlight patterns are saved. Thanks to @BoruiGu !
  [#28](https://github.com/ryu1kn/vscode-text-marker/issues/28)

## [1.9.0] - 2018-09-18
### Added
- Apply the opacity value to the colours on overview rulers.

### Changed
- `textmarker.useHighlightColorOnRuler` is now default `true`, as colours would more likely to have opacity
  and they can be blended instead of one of them overwrite the others.

## [1.8.0] - 2018-09-15
### Added
- Highlight colour can now be updated through right-click menu. [#22](https://github.com/ryu1kn/vscode-text-marker/issues/22)
- Usage data collecting capability, together with the configuration (`textmarker.enableTelemetry`) which stops Text Marker to collect usage data.

## [1.7.0] - 2018-08-28
### Added
- Configuration for opacity for all highlights. Easy to see overwrapped patterns. [#23](https://github.com/ryu1kn/vscode-text-marker/issues/23)

## [1.6.0] - 2018-08-09
### Added
- New configuration for individually show/hide Text Marker commands on the context menu. [#21](https://github.com/ryu1kn/vscode-text-marker/issues/21)

## [1.5.0] - 2018-08-06
### Added
- Auto-scroll window if a new cursor location is out of the visible area. [#20](https://github.com/ryu1kn/vscode-text-marker/issues/20)

## [1.4.0] - 2018-08-05
### Added
- Feature to jump to next/previous location of the same highlight. [#14](https://github.com/ryu1kn/vscode-text-marker/issues/14)

## [1.3.1] - 2018-07-22
### Fixed
- Fixed the issue that a string pattern highlight could not be toggled off by selecting the exact same text.
  [#18](https://github.com/ryu1kn/vscode-text-marker/issues/18)

## [1.3.0] - 2018-06-22
### Added
- New configurations to set default modes for case sensitivity and whole match. [#19](https://github.com/ryu1kn/vscode-text-marker/issues/19)

## [1.2.0] - 2018-06-21
### Added
- Text colour can be automatically chosen so that it stands out from the background highlight. Thanks to @Kronuz !
  [#15](https://github.com/ryu1kn/vscode-text-marker/issues/15) & [#17](https://github.com/ryu1kn/vscode-text-marker/issues/17)

## [1.1.0] - 2018-05-15
### Added
- Introduced a configuration to change the default highlight colour. [#16](https://github.com/ryu1kn/vscode-text-marker/issues/16)

## [1.0.0] - 2018-05-12
### Added
- Introduced a configuration to use the highlight colour on the ruler. [#12](https://github.com/ryu1kn/vscode-text-marker/issues/12)

### Removed
- Removed deprecated commands: **Highlight Selected Text** and **Mark Text to Highlight/Unhighlight**

## [0.11.0] - 2018-02-17
### Added
- Introduced **Save All Highlights** command. Saved highlights are restored next time you open the editor. [#5](https://github.com/ryu1kn/vscode-text-marker/issues/5)

## [0.10.1] - 2017-09-14
### Fixed
- Fixed the link to the gif animation

## [0.10.0] - 2017-06-11
### Added
- Introduced **Update Highlight** command. You can change the pattern, case sensitivity or whole/partial match of an existing highlight, available as a right-click menu.

### Changed
- Deprecated **Highlight Selected Text** command in favour of **Toggle Highlight** commands.

## [0.9.0] - 2017-06-06
### Added
- Introduced **Toggle Highlight** command. When you remove highlight with this command, it works not only string type highlight but also regex type highlight. [#6](https://github.com/ryu1kn/vscode-text-marker/issues/6)

### Changed
- Right click menu **Highlight Selected Text** has been replaced with **Toggle Highlight** command.

## [0.8.0] - 2017-06-04
### Added
- Introduced the mode for whole match. Whether text matching is done with whole match is decided by the current mode.
  The mode can be flipped with **Toggle Mode for Whole/Partial Match** command accessible from the status bar.

## [0.7.0] - 2017-06-03
### Added
- Support "whole match" text matching. [#7](https://github.com/ryu1kn/vscode-text-marker/issues/7)

## [0.6.1] - 2017-06-02
### Fixed
- Fixed the problem that the symbols for representing the current mode for case sensitivity were used in reverse

## [0.6.0] - 2017-06-02
### Added
- Introduced the mode for case sensitivity. Whether text matching should be done by ignoring case is decided by the current mode.
  The mode can be flipped with **Toggle Mode for Case Sensitivity** command accessible from the status bar.

## [0.5.0] - 2017-05-28
### Added
- Support case insensitive text matching

## [0.4.0] - 2017-05-24
### Added
- Support regex to highlight text. [#8](https://github.com/ryu1kn/vscode-text-marker/issues/8)
- Put **Highlight Selected Text** command in the right click menu

### Changed
- Deprecated **Mark Text to Highlight/Unhighlight** command in favour of **Highlight Selected Text** and **Unhighlight Text** commands. [#8](https://github.com/ryu1kn/vscode-text-marker/issues/8)

## [0.3.0] - 2016-11-07
### Added
- Select the word under the cursor if no text is selected when triggering mark text command. [#3](https://github.com/ryu1kn/vscode-text-marker/issues/3)

## [0.2.0] - 2016-11-04
### Added
- Utilised `OverviewRuler` to help users easily find where in the file highlighted texts can be found. [#4](https://github.com/ryu1kn/vscode-text-marker/issues/4)

## [0.1.0] - 2016-09-13
### Added
- Added **Clear All Highlights** command to remove all highlights at once

## [0.0.1] - 2016-07-05
### Added
- Initial release of Text Marker
