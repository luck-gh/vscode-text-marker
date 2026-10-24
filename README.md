# Text Marker Custom

简体中文 | [English](https://github.com/luck-gh/vscode-text-marker/blob/v1.12.0/README.en.md)

![Text Marker Custom](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.12.0/images/text-marker-custom.png)

十色文本高亮, 可调边框和圆角, 支持英文与简繁中文界面. 选中 `au8_data[0]` 等文本即可高亮完整匹配项, 也可以使用正则表达式.

本扩展由 `luck-gh` 发布, ID 为 `luck-gh.text-marker-custom`. 基于 [Ryuichi Inagaki 的 Text Marker](https://github.com/ryu1kn/vscode-text-marker), 保留原 MIT 署名. 使用独立名称和原创高亮笔图标. 本 Fork 已移除扩展使用遥测及相关依赖.

介绍页通过上方链接手动切换中英文. 插件的菜单, 设置说明和运行时提示会在重启后自动跟随 VS Code 显示语言, 支持英文, 简体中文和繁体中文; 其他语言使用英文.

## 安装与原版迁移

需要 VS Code 1.73 或更高版本. 可从 [GitHub Release](https://github.com/luck-gh/vscode-text-marker/releases/tag/v1.12.0) 下载 VSIX, 执行 `Extensions: Install from VSIX...` 安装. Marketplace 发布后也可按 ID `luck-gh.text-marker-custom` 查找安装.

切换前先禁用或卸载原版 `ryu1kn.text-marker`. 两个版本沿用同一套 `textmarker.*` 命令和设置, 不能同时启用. 已保存的高亮规则, 个人调色板和自定义快捷键继续使用原标识符. 安装不会重写用户配置; 旧版仍在运行的窗口需要执行 `Developer: Reload Window`.

## 使用方式

- 选中文本, 在右键的高亮颜色子菜单中选择十种颜色之一.
- 在已有高亮上重新选色可直接换色, 保留原正则表达式和大小写, 整词匹配选项.
- 修改边框, 圆角或透明度后, 已有高亮立即刷新.
- 使用命令面板中的正则高亮, 编辑高亮规则, 清除全部高亮, 保存全部高亮等命令.
- 状态栏可切换大小写与整词匹配模式. 下一个或上一个相同高亮命令可通过命令面板调用.

| 设置 | 含义 |
| --- | --- |
| `textmarker.borderWidth` | 边框宽度, 单位 px; `0` 关闭边框. |
| `textmarker.borderStyle` | `solid`, `dashed`, `dotted`, `double` 或 `none`. |
| `textmarker.borderRadius` | 圆角半径, 单位 px; `0` 为直角, `999` 为胶囊形. |
| `textmarker.defaultHighlightOpacity` | 背景透明度, 范围 `0` 到 `1`. |
| `textmarker.highlightColors` | 自动分配高亮使用的调色板. 右键十色菜单为固定预设. |
| `textmarker.autoSelectDistinctiveTextColor` | `false` 保留语法高亮文字颜色. |

## 推荐配置

这套配置采用日常使用的十色调色板, 25% 背景透明度和胶囊形边框. 自动文字对比沿用默认关闭行为, 在推荐块中显式设为 `false`, 以保留原有语法字色.

把下面的配置项合并到用户 `settings.json` 中. 这是 JSONC, 行注释可直接保留.

```jsonc
{
    // 区分大小写, 按部分文本匹配.
    "textmarker.enableIgnoreCase": false,
    "textmarker.enableWholeMatch": false,

    // 自动分配高亮时使用的十色调色板, 与右键颜色菜单一致.
    "textmarker.highlightColors": [
        "#00BCD4", // 青色
        "#5C8DFF", // 蓝色
        "#FFEB3B", // 黄色
        "#AB47BC", // 紫色
        "#4CAF50", // 绿色
        "#FF5252", // 红色
        "#FF80AB", // 粉色
        "#CDDC39", // 黄绿色
        "#26A69A", // 蓝绿色
        "#B0BEC5"  // 银灰色
    ],

    // 背景透明度为 25%, 保留原有语法高亮文字颜色.
    "textmarker.defaultHighlightOpacity": 0.25,
    "textmarker.autoSelectDistinctiveTextColor": false,

    // 同色 1px 实线边框, 999px 圆角呈胶囊形.
    "textmarker.borderWidth": 1,
    "textmarker.borderStyle": "solid",
    "textmarker.borderRadius": 999,

    // 精简其他右键命令. 十色子菜单始终可用, 不受此对象控制.
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

将下面两项合并到用户 `keybindings.json` 的数组中. `Ctrl+H` 在编辑器内会覆盖默认的查找替换快捷键.

```jsonc
[
    {
        // 编辑器内用 Ctrl+H 切换高亮, 覆盖默认的查找替换快捷键.
        "key": "ctrl+h",
        "command": "textmarker.toggleHighlight",
        "when": "editorTextFocus"
    },
    {
        // 编辑器内用 Ctrl+Alt+H 取消高亮.
        "key": "ctrl+alt+h",
        "command": "textmarker.unhighlight",
        "when": "editorTextFocus"
    }
]
```

## 原作者演示

以下三张动图沿用 [原项目](https://github.com/ryu1kn/vscode-text-marker) 的 MIT 资源, 展示基础高亮, 匹配模式和规则编辑. 新增十色菜单与样式配置见上文.

高亮与取消高亮:

![原作者演示: 高亮与取消高亮](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.12.0/images/animations/public.gif)

大小写与整词匹配:

![原作者演示: 匹配模式](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.12.0/images/animations/ignore-case-and-whole-match.gif)

编辑已有规则:

![原作者演示: 编辑高亮规则](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.12.0/images/animations/update-highlight.gif)

## 开发, 反馈与许可

- [提交问题](https://github.com/luck-gh/vscode-text-marker/issues).
- [构建与测试说明](https://github.com/luck-gh/vscode-text-marker/blob/v1.12.0/CONTRIBUTING.md), 包含编译, 模拟测试和隔离的三语真实宿主验收.
- [更新记录](https://github.com/luck-gh/vscode-text-marker/blob/v1.12.0/CHANGELOG.md).
- [MIT 许可证](https://github.com/luck-gh/vscode-text-marker/blob/v1.12.0/LICENSE.txt), 保留 `Copyright (c) 2016 Ryuichi Inagaki`.
