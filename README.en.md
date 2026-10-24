# Text Marker Custom

[简体中文](https://github.com/luck-gh/vscode-text-marker/blob/v1.13.0/README.md) | English

![Text Marker Custom](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.13.0/images/text-marker-custom.png)

Ten-color text highlights with configurable borders and corners, and English and Chinese UI. Select text such as `au8_data[0]` to highlight full matches, or use a regular expression.

Published by `luck-gh` as `luck-gh.text-marker-custom`. Based on [Text Marker by Ryuichi Inagaki](https://github.com/ryu1kn/vscode-text-marker), with the original MIT notice preserved. This fork uses a separate name and an original highlighter icon, and removes extension usage telemetry and its dependencies.

The links above switch this introduction manually. Extension menus, setting descriptions and runtime prompts follow the VS Code display language after restart. English, Simplified Chinese and Traditional Chinese are supported; other languages use English.

## Installation and migration

Requires VS Code 1.73 or later. Download the VSIX from the [GitHub Release](https://github.com/luck-gh/vscode-text-marker/releases/tag/v1.13.0) and run `Extensions: Install from VSIX...`. After Marketplace publication, the extension can also be found by ID `luck-gh.text-marker-custom`.

Disable or uninstall the original `ryu1kn.text-marker` first. Both editions use the same `textmarker.*` setting and command identifiers and must not be enabled together. Saved highlight rules, personal colors and custom keybindings retain those identifiers. Installation does not rewrite user configuration. Run `Developer: Reload Window` if an older edition is still active.

## Usage

- With the recommended keys below, Ctrl+H adds a highlight using the first unused palette color. Repeating Ctrl+H cycles an existing rule through `textmarker.highlightColors`, wrapping to the first color without removing it. Ctrl+Alt+H opens the picker to remove a chosen rule.
- Select text and choose one of ten colors from the editor context submenu.
- Choose a new color on an existing highlight to recolor it while preserving its regex expression and matching options.
- Border, radius and opacity changes refresh existing highlights immediately.
- Use the command palette to highlight with regex, edit rules, clear all highlights or save all highlights.
- Switch case and whole-word matching modes from the status bar. Next/previous matching-highlight commands remain available from the command palette.

| Setting | Meaning |
| --- | --- |
| `textmarker.borderWidth` | Width in pixels; `0` disables the border. |
| `textmarker.borderStyle` | `solid`, `dashed`, `dotted`, `double` or `none`. |
| `textmarker.borderRadius` | Radius in pixels; `0` is square and `999` is pill-shaped. |
| `textmarker.defaultHighlightOpacity` | Background opacity between `0` and `1`. |
| `textmarker.highlightColors` | Palette for automatic allocation and cycling in order. The context submenu uses fixed presets. |
| `textmarker.autoSelectDistinctiveTextColor` | `false` preserves syntax text colors. |

## Recommended settings

This everyday configuration uses the ten-color palette, 25% background opacity (75% transparent) and pill-shaped borders. Automatic contrasting text remains disabled, as it is by default; the explicit `false` preserves syntax text colors.

Merge these entries into your user `settings.json`. Each line explains its effect and why this value is recommended. The JSONC comments can be retained.

```jsonc
{
    "textmarker.enableIgnoreCase": false,   // Match case, so differently cased identifiers remain distinct.
    "textmarker.enableWholeMatch": false,   // Allow matching selected substrings within longer text, including array expressions.

    "textmarker.highlightColors": [ // New rules prefer unused colors; repeated Ctrl+H follows this order and wraps, making categories easy to tell apart.
        "#00BCD4",                  // Cyan
        "#5C8DFF",                  // Blue
        "#FFEB3B",                  // Yellow
        "#AB47BC",                  // Purple
        "#4CAF50",                  // Green
        "#FF5252",                  // Red
        "#FF80AB",                  // Pink
        "#CDDC39",                  // Lime
        "#26A69A",                  // Teal
        "#B0BEC5"                   // Silver
    ],

    "textmarker.defaultHighlightOpacity": 0.25,         // Background opacity is 0..1: 0 is transparent, 1 opaque; 25% leaves code readable and does not fade the border.
    "textmarker.autoSelectDistinctiveTextColor": false, // Keep syntax text colors instead of automatically replacing them with contrasting text.

    "textmarker.borderWidth": 1,        // A 1px border follows the highlight color and keeps the outline visible; 0 disables it.
    "textmarker.borderStyle": "solid",  // Use a continuous outline; alternatives are dashed, dotted, double and none.
    "textmarker.borderRadius": 999,     // Radius in px: 999 makes pill-shaped ends for a softer outline; 0 gives square corners.

    "textmarker.commandsOnContextMenu": {   // true shows a command and false hides it, keeping common actions handy; the fixed ten-color submenu is always available.
        "toggleHighlight": true,            // Show Cycle Highlight Color to add a rule or cycle its color without removing it.
        "unhighlight": true,                // Show removal of a selected rule, keeping cancellation separate from cycling.
        "clearAllHighlight": true,          // Show Clear All to reset the current collection quickly when changing tasks.
        "updateHighlight": true,            // Show rule editing to adjust the expression, color or matching options in place.
        "goToNextHighlight": false,         // Hide forward navigation to reduce menu size; the command palette still provides it.
        "goToPreviousHighlight": false,     // Hide backward navigation for the same reason; it remains in the command palette.
        "highlightUsingRegex": true,        // Show regex highlighting to mark related strings such as all array indices with one rule.
        "toggleCaseSensitivity": false,     // Hide per-rule case switching to reduce clutter; edit a rule when an exception is needed.
        "toggleWholeMatch": false,          // Hide per-rule whole-word switching; rule editing remains available when needed.
        "saveAllHighlights": false          // Hide persistence because temporary reading marks are usually enough; save explicitly from the palette when needed.
    }
}
```

Merge these two entries into the array in user `keybindings.json`. In the editor, `Ctrl+H` overrides the default Replace shortcut.

```jsonc
[
    {
        "key": "ctrl+h",                            // Use Ctrl+H for quick highlighting; this overrides the editor Replace shortcut.
        "command": "textmarker.toggleHighlight",    // New text gets an unused palette color first; existing rules cycle to the next color and wrap, preserving regex and options.
        "when": "editorTextFocus"                   // Apply only while editing text, so the shortcut does not affect other views.
    },

    {
        "key": "ctrl+alt+h",                    // Keep a separate shortcut for deliberate removal, avoiding accidental cancellation while cycling colors.
        "command": "textmarker.unhighlight",    // Open the highlight picker and remove only the chosen rule; other highlights remain.
        "when": "editorTextFocus"               // Limit removal to the text editor to match the Ctrl+H shortcut scope.
    }
]
```

An existing color outside the current palette starts at its first entry on the next cycle. A one-color palette keeps that color. An empty palette cannot cycle and reports an error; new highlights use `textmarker.defaultHighlightColor` when no palette color is available. Invalid CSS colors report a configuration error. Cycling may share a color with another rule; new allocation still prefers unused colors.

## Original demonstrations

These three animations are reused from the [original MIT-licensed project](https://github.com/ryu1kn/vscode-text-marker). They demonstrate basic highlighting, matching modes and rule editing. The new color submenu and style controls are described above.

Highlight and unhighlight (original behavior):

The first animation shows the old toggle command removing a highlight on its second invocation. Since 1.13.0, **Cycle Highlight Color** adds or recolors instead. Use **Unhighlight** (recommended Ctrl+Alt+H) to remove a rule. The fixed ten-color submenu and current styles are not shown in these original animations.

![Original demonstration: highlight and unhighlight](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.13.0/images/animations/public.gif)

Case and whole-word matching:

![Original demonstration: matching modes](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.13.0/images/animations/ignore-case-and-whole-match.gif)

Edit an existing rule:

![Original demonstration: edit highlight rules](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.13.0/images/animations/update-highlight.gif)

## Development, feedback and license

- [Report an issue](https://github.com/luck-gh/vscode-text-marker/issues).
- [Build and test instructions](https://github.com/luck-gh/vscode-text-marker/blob/v1.13.0/CONTRIBUTING.md), including compilation, stub tests and isolated real-host checks in all three display languages.
- [Changelog](https://github.com/luck-gh/vscode-text-marker/blob/v1.13.0/CHANGELOG.md).
- [MIT license](https://github.com/luck-gh/vscode-text-marker/blob/v1.13.0/LICENSE.txt), preserving `Copyright (c) 2016 Ryuichi Inagaki`.
