# Text Marker Custom

[简体中文](https://github.com/luck-gh/vscode-text-marker/blob/v1.14.1/README.md) | English

![Text Marker Custom](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.14.1/images/text-marker-custom.png)

Configurable text highlights with configurable borders and corners, and English and Chinese UI. Select text such as `au8_data[0]` to highlight full matches, or use a regular expression.

Published by `luck-gh` as `luck-gh.text-marker-custom`. Based on [Text Marker by Ryuichi Inagaki](https://github.com/ryu1kn/vscode-text-marker), with the original MIT notice preserved. This fork uses a separate name and an original highlighter icon, and removes extension usage telemetry and its dependencies.

The links above switch this introduction manually. Extension menus, setting descriptions and runtime prompts follow the VS Code display language after restart. English, Simplified Chinese and Traditional Chinese are supported; other languages use English.

## Installation and migration

Requires VS Code 1.73 or later. Download the VSIX from the [GitHub Release](https://github.com/luck-gh/vscode-text-marker/releases/tag/v1.14.1) and run `Extensions: Install from VSIX...`. After Marketplace publication, the extension can also be found by ID `luck-gh.text-marker-custom`.

Disable or uninstall the original `ryu1kn.text-marker` first. Both editions use the same `textmarker.*` setting and command identifiers and must not be enabled together. Saved highlight rules, personal colors and custom keybindings retain those identifiers. Installation does not rewrite user configuration. Run `Developer: Reload Window` if an older edition is still active.

## Usage

- With the recommended keys below, Ctrl+H adds a highlight using the first unused palette color. Repeating Ctrl+H cycles an existing rule through `textmarker.highlightColors`, wrapping to the first color without removing it. Ctrl+Alt+H opens the picker to remove a chosen rule.
- Select text and hover over **Set Highlight** to open its native submenu. **Color 1**, **Color 2**, and subsequent entries follow the current `textmarker.highlightColors` order, up to 30 entries. Choosing entry N uses the current Nth configured color. Configuration changes apply immediately without reinstallation or reload. Labels are fixed numbers rather than dynamic color names. An empty palette hides the submenu.
- Choose a new color on an existing highlight to recolor it while preserving its regex expression and matching options.
- Border, radius and opacity changes refresh existing highlights immediately.
- Choose **Edit highlight rules** to open the matching input directly. Use one input for literal text or regex, with `Aa` (Match Case), `Ab|` (Match Whole Words), and `.*` (Regular Expression) buttons at the top right. The prompt displays all three current states. Existing rules open with their own modes; Enter applies, Esc discards, and invalid regex is explained inline and cannot be applied. The matching options apply to this rule and leave its color and global defaults unchanged. If the cursor or selection does not identify one rule, choose the rule first. The first entry is **Add rule**, including when no highlights exist. New rules start in regex mode with the global case/whole-word defaults; switch to text mode for literals such as `au8_data[0]`. Enter creates the rule and allocates its color; Esc leaves rules and colors untouched. This creation entry requires a nonempty palette when submitted; an empty palette shows an error and creates no rule. Configure a color and submit again.
- **Highlight using a regular expression** opens the same input with regex enabled; it can also switch to literal text. Use the command palette to clear or save all highlights.
- Switch case and whole-word matching modes from the status bar. Use **Go to Next Same Highlight** and **Go to Previous Same Highlight** from the context menu or command palette to cycle through the current rule. With no rules and no selected text, navigation does nothing; selected text retains the existing behavior of creating a highlight and navigating.

The context menu contains six entries: **Set Highlight**, **Edit Highlight Rules**, **Remove Selected Highlight**, **Clear All Highlights**, **Go to Next Same Highlight**, and **Go to Previous Same Highlight**. All are visible by default and have individual visibility settings below. The submenu supports up to 30 colors; further colors still participate in Ctrl+H cycling and automatic allocation. The old fixed ten-color commands are replaced by configuration-driven numbered colors.

On VS Code 1.108, the native extension API places these buttons on the title bar above the input, so their position differs from the inline buttons in Ctrl+F. Read the prompt below the input for the current on/off states.

| Setting | Meaning |
| --- | --- |
| `textmarker.borderWidth` | Width in pixels; `0` disables the border. |
| `textmarker.borderStyle` | `solid`, `dashed`, `dotted`, `double` or `none`. |
| `textmarker.borderRadius` | Radius in pixels; `0` is square and `999` is pill-shaped. |
| `textmarker.defaultHighlightOpacity` | Background opacity between `0` and `1`. |
| `textmarker.highlightColors` | Palette for automatic allocation and cycling in order. The **Set Highlight** submenu follows the first 30 configured colors and can be shown or hidden with `commandsOnContextMenu.toggleHighlight`. |
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

    "textmarker.commandsOnContextMenu": {   // true shows a context command and false hides it; toggleHighlight controls the Set Highlight palette submenu.
        "toggleHighlight": true,            // Show Set Highlight; hover to choose directly from the first 30 configured colors.
        "unhighlight": true,                // Show removal of a selected rule, keeping cancellation separate from cycling.
        "clearAllHighlight": true,          // Show Clear All to reset the current collection quickly when changing tasks.
        "updateHighlight": true,            // Show rule editing to adjust text, case, whole-word and regex options; use Set Highlight to change color.
        "goToNextHighlight": true,           // Show Next Same Highlight to cycle forward through the current rule while reading a variable.
        "goToPreviousHighlight": true        // Show Previous Same Highlight to cycle back to the preceding occurrence.
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

An existing color outside the current palette starts at its first entry on the next cycle. A one-color palette keeps that color. An empty palette cannot cycle and shows an error notification without changing the rule; new highlights use `textmarker.defaultHighlightColor` when no palette color is available. Cycling may share a color with another rule; new allocation still prefers unused colors.

## Original demonstrations

These three animations are reused from the [original MIT-licensed project](https://github.com/ryu1kn/vscode-text-marker). They demonstrate basic highlighting, matching modes and rule editing. The new color submenu and style controls are described above.

Highlight and unhighlight (original behavior):

The first animation shows the old toggle command removing a highlight on its second invocation. Since 1.13.0, **Cycle Highlight Color** adds or recolors instead. Use **Unhighlight** (recommended Ctrl+Alt+H) to remove a rule. The current configuration-driven numbered color submenu and styles are not shown in these original animations.

![Original demonstration: highlight and unhighlight](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.14.1/images/animations/public.gif)

Case and whole-word matching:

![Original demonstration: matching modes](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.14.1/images/animations/ignore-case-and-whole-match.gif)

Edit an existing rule:

Since 1.14.0, the action-selection step shown in this original animation is removed. Editing opens the rule input directly, with `Aa` / `Ab|` / `.*` buttons.

![Original demonstration: edit highlight rules](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.14.1/images/animations/update-highlight.gif)

## Development, feedback and license

- [Report an issue](https://github.com/luck-gh/vscode-text-marker/issues).
- [Build and test instructions](https://github.com/luck-gh/vscode-text-marker/blob/v1.14.1/CONTRIBUTING.md), including compilation, stub tests and isolated real-host checks in all three display languages.
- [Changelog](https://github.com/luck-gh/vscode-text-marker/blob/v1.14.1/CHANGELOG.md).
- [MIT license](https://github.com/luck-gh/vscode-text-marker/blob/v1.14.1/LICENSE.txt), preserving `Copyright (c) 2016 Ryuichi Inagaki`.
