# Text Marker Custom

[简体中文](https://github.com/luck-gh/vscode-text-marker/blob/v1.12.0/README.md) | English

![Text Marker Custom](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.12.0/images/text-marker-custom.png)

Ten-color text highlights with configurable borders and corners, and English and Chinese UI. Select text such as `au8_data[0]` to highlight full matches, or use a regular expression.

Published by `luck-gh` as `luck-gh.text-marker-custom`. Based on [Text Marker by Ryuichi Inagaki](https://github.com/ryu1kn/vscode-text-marker), with the original MIT notice preserved. This fork uses a separate name and an original highlighter icon, and removes extension usage telemetry and its dependencies.

The links above switch this introduction manually. Extension menus, setting descriptions and runtime prompts follow the VS Code display language after restart. English, Simplified Chinese and Traditional Chinese are supported; other languages use English.

## Installation and migration

Requires VS Code 1.73 or later. Download the VSIX from the [GitHub Release](https://github.com/luck-gh/vscode-text-marker/releases/tag/v1.12.0) and run `Extensions: Install from VSIX...`. After Marketplace publication, the extension can also be found by ID `luck-gh.text-marker-custom`.

Disable or uninstall the original `ryu1kn.text-marker` first. Both editions use the same `textmarker.*` setting and command identifiers and must not be enabled together. Saved highlight rules, personal colors and custom keybindings retain those identifiers. Installation does not rewrite user configuration. Run `Developer: Reload Window` if an older edition is still active.

## Usage

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
| `textmarker.highlightColors` | Palette for automatic allocation. The context submenu uses fixed presets. |
| `textmarker.autoSelectDistinctiveTextColor` | `false` preserves syntax text colors. |

## Recommended settings

This everyday configuration uses the ten-color palette, 25% background opacity and pill-shaped borders. Automatic contrasting text remains disabled, as it is by default; the explicit `false` preserves syntax text colors.

Merge these entries into your user `settings.json`. The JSONC comments can be retained.

```jsonc
{
    // Match case and allow partial text matches.
    "textmarker.enableIgnoreCase": false,
    "textmarker.enableWholeMatch": false,

    // Automatic highlight allocation uses the same ten colors as the submenu.
    "textmarker.highlightColors": [
        "#00BCD4", // Cyan
        "#5C8DFF", // Blue
        "#FFEB3B", // Yellow
        "#AB47BC", // Purple
        "#4CAF50", // Green
        "#FF5252", // Red
        "#FF80AB", // Pink
        "#CDDC39", // Lime
        "#26A69A", // Teal
        "#B0BEC5"  // Silver
    ],

    // Use 25% background opacity and preserve syntax text colors.
    "textmarker.defaultHighlightOpacity": 0.25,
    "textmarker.autoSelectDistinctiveTextColor": false,

    // A 1px solid border in the highlight color, with pill-shaped corners.
    "textmarker.borderWidth": 1,
    "textmarker.borderStyle": "solid",
    "textmarker.borderRadius": 999,

    // Show selected context commands. The ten-color submenu remains available.
    "textmarker.commandsOnContextMenu": {
        "toggleHighlight": true,
        "unhighlight": true,
        "clearAllHighlight": true,
        "updateHighlight": true,
        "goToNextHighlight": false,
        "goToPreviousHighlight": false,
        "highlightUsingRegex": true,
        "toggleCaseSensitivity": false,
        "toggleWholeMatch": false,
        "saveAllHighlights": false
    }
}
```

Merge these two entries into the array in user `keybindings.json`. In the editor, `Ctrl+H` overrides the default Replace shortcut.

```jsonc
[
    {
        // Ctrl+H toggles highlights in the editor, overriding Replace's default shortcut.
        "key": "ctrl+h",
        "command": "textmarker.toggleHighlight",
        "when": "editorTextFocus"
    },
    {
        // Ctrl+Alt+H removes a highlight in the editor.
        "key": "ctrl+alt+h",
        "command": "textmarker.unhighlight",
        "when": "editorTextFocus"
    }
]
```

## Original demonstrations

These three animations are reused from the [original MIT-licensed project](https://github.com/ryu1kn/vscode-text-marker). They demonstrate basic highlighting, matching modes and rule editing. The new color submenu and style controls are described above.

Highlight and unhighlight:

![Original demonstration: highlight and unhighlight](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.12.0/images/animations/public.gif)

Case and whole-word matching:

![Original demonstration: matching modes](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.12.0/images/animations/ignore-case-and-whole-match.gif)

Edit an existing rule:

![Original demonstration: edit highlight rules](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.12.0/images/animations/update-highlight.gif)

## Development, feedback and license

- [Report an issue](https://github.com/luck-gh/vscode-text-marker/issues).
- [Build and test instructions](https://github.com/luck-gh/vscode-text-marker/blob/v1.12.0/CONTRIBUTING.md), including compilation, stub tests and isolated real-host checks in all three display languages.
- [Changelog](https://github.com/luck-gh/vscode-text-marker/blob/v1.12.0/CHANGELOG.md).
- [MIT license](https://github.com/luck-gh/vscode-text-marker/blob/v1.12.0/LICENSE.txt), preserving `Copyright (c) 2016 Ryuichi Inagaki`.
