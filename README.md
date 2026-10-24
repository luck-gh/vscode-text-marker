# Text Marker Custom

简体中文 | [English](https://github.com/luck-gh/vscode-text-marker/blob/v1.13.0/README.en.md)

![Text Marker Custom](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.13.0/images/text-marker-custom.png)

十色文本高亮, 可调边框和圆角, 支持英文与简繁中文界面. 选中 `au8_data[0]` 等文本即可高亮完整匹配项, 也可以使用正则表达式.

本扩展由 `luck-gh` 发布, ID 为 `luck-gh.text-marker-custom`. 基于 [Ryuichi Inagaki 的 Text Marker](https://github.com/ryu1kn/vscode-text-marker), 保留原 MIT 署名. 使用独立名称和原创高亮笔图标. 本 Fork 已移除扩展使用遥测及相关依赖.

介绍页通过上方链接手动切换中英文. 插件的菜单, 设置说明和运行时提示会在重启后自动跟随 VS Code 显示语言, 支持英文, 简体中文和繁体中文; 其他语言使用英文.

## 安装与原版迁移

需要 VS Code 1.73 或更高版本. 可从 [GitHub Release](https://github.com/luck-gh/vscode-text-marker/releases/tag/v1.13.0) 下载 VSIX, 执行 `Extensions: Install from VSIX...` 安装. Marketplace 发布后也可按 ID `luck-gh.text-marker-custom` 查找安装.

切换前先禁用或卸载原版 `ryu1kn.text-marker`. 两个版本沿用同一套 `textmarker.*` 命令和设置, 不能同时启用. 已保存的高亮规则, 个人调色板和自定义快捷键继续使用原标识符. 安装不会重写用户配置; 旧版仍在运行的窗口需要执行 `Developer: Reload Window`.

## 使用方式

- 使用下方推荐快捷键时, Ctrl+H 为新文本添加高亮, 优先使用色板未占用颜色; 对已有规则按 `textmarker.highlightColors` 顺序循环换色, 末尾回到首色, 不取消高亮. Ctrl+Alt+H 打开列表取消指定规则.
- 选中文本, 在右键的高亮颜色子菜单中选择十种颜色之一.
- 在已有高亮上重新选色可直接换色, 保留原正则表达式和大小写, 整词匹配选项.
- 修改边框, 圆角或背景不透明度后, 已有高亮立即刷新.
- 使用命令面板中的正则高亮, 编辑高亮规则, 清除全部高亮, 保存全部高亮等命令.
- 状态栏可切换大小写与整词匹配模式. 下一个或上一个相同高亮命令可通过命令面板调用.

| 设置 | 含义 |
| --- | --- |
| `textmarker.borderWidth` | 边框宽度, 单位 px; `0` 关闭边框. |
| `textmarker.borderStyle` | `solid`, `dashed`, `dotted`, `double` 或 `none`. |
| `textmarker.borderRadius` | 圆角半径, 单位 px; `0` 为直角, `999` 为胶囊形. |
| `textmarker.defaultHighlightOpacity` | 背景不透明度, 范围 `0` 到 `1`; `0` 为完全透明. |
| `textmarker.highlightColors` | 自动分配与按顺序循环换色使用的调色板. 右键十色菜单为固定预设. |
| `textmarker.autoSelectDistinctiveTextColor` | `false` 保留语法高亮文字颜色. |

## 推荐配置

这套配置采用日常使用的十色调色板, 25% 背景不透明度 (75% 透明) 和胶囊形边框. 自动文字对比沿用默认关闭行为, 在推荐块中显式设为 `false`, 以保留原有语法字色.

把下面的配置项合并到用户 `settings.json` 中. 每行注释说明作用及推荐这个值的原因. 这是 JSONC, 行注释可直接保留.

```jsonc
{
    "textmarker.enableIgnoreCase": false,   // 关闭忽略大小写, 区分大小写不同的标识符, 避免把不同变量混为一类.
    "textmarker.enableWholeMatch": false,   // 关闭整词限制, 允许在较长文本中匹配选中的字符串, 适合变量片段和数组表达式.

    "textmarker.highlightColors": [ // 新规则按顺序优先取未占用颜色; 重复 Ctrl+H 按此顺序循环换色, 便于区分多类文本.
        "#00BCD4",                  // 青色
        "#5C8DFF",                  // 蓝色
        "#FFEB3B",                  // 黄色
        "#AB47BC",                  // 紫色
        "#4CAF50",                  // 绿色
        "#FF5252",                  // 红色
        "#FF80AB",                  // 粉色
        "#CDDC39",                  // 黄绿色
        "#26A69A",                  // 蓝绿色
        "#B0BEC5"                   // 银灰色
    ],

    "textmarker.defaultHighlightOpacity": 0.25,         // 背景不透明度范围 0~1, 0 为全透明, 1 为不透明; 25% (75% 透明) 让代码仍易读, 不影响边框.
    "textmarker.autoSelectDistinctiveTextColor": false, // 关闭自动对比字色, 保留编辑器原有语法高亮文字颜色, 避免覆盖代码配色.

    "textmarker.borderWidth": 1,        // 边框宽度为 1px, 颜色跟随高亮色, 在浅背景上仍能看清轮廓; 0 关闭边框.
    "textmarker.borderStyle": "solid",  // 使用连续实线便于辨认范围; 也可选 dashed 虚线, dotted 点线, double 双线, none 不显示.
    "textmarker.borderRadius": 999,     // 圆角半径单位 px; 999 形成胶囊轮廓, 视觉更柔和; 0 为直角.

    "textmarker.commandsOnContextMenu": {   // true 显示, false 隐藏, 只保留常用操作减少菜单拥挤; 固定十色子菜单始终可用.
        "toggleHighlight": true,            // 显示切换高亮颜色, 便于新建高亮或为已有规则循环换色, 不会取消高亮.
        "unhighlight": true,                // 显示取消指定高亮, 为移除某一条规则提供独立入口.
        "clearAllHighlight": true,          // 显示清除全部高亮, 切换阅读任务时可以一次清空当前规则.
        "updateHighlight": true,            // 显示编辑高亮规则, 方便直接调整表达式, 颜色或匹配选项.
        "goToNextHighlight": false,         // 隐藏向后跳转命令以精简菜单; 需要时仍可从命令面板跳到下一个相同高亮.
        "goToPreviousHighlight": false,     // 隐藏向前跳转命令以精简菜单; 需要时仍可从命令面板跳到上一个相同高亮.
        "highlightUsingRegex": true,        // 显示正则高亮, 便于用一条规则匹配一组相关文本, 例如同一数组的不同下标.
        "toggleCaseSensitivity": false,     // 隐藏逐规则大小写切换以减少菜单项; 特例可通过编辑规则调整.
        "toggleWholeMatch": false,          // 隐藏逐规则整词切换以减少菜单项; 需要时仍可编辑该规则.
        "saveAllHighlights": false          // 隐藏保存全部高亮, 日常阅读通常只需临时标记; 需要持久化时从命令面板主动保存.
    }
}
```

将下面两项合并到用户 `keybindings.json` 的数组中. `Ctrl+H` 在编辑器内会覆盖默认的查找替换快捷键.

```jsonc
[
    {
        "key": "ctrl+h",                            // 使用 Ctrl+H 快速操作高亮, 会覆盖编辑器默认的查找替换快捷键.
        "command": "textmarker.toggleHighlight",    // 新文本优先取色板未占用颜色; 已高亮规则按色板循环换色并回到首色, 保留正则及匹配选项.
        "when": "editorTextFocus"                   // 仅编辑器文本获得焦点时生效, 避免影响其他面板.
    },

    {
        "key": "ctrl+alt+h",                    // 用独立快捷键执行明确的取消操作, 换色时不误删规则.
        "command": "textmarker.unhighlight",    // 打开高亮选择列表并移除指定规则, 其他高亮保持不变.
        "when": "editorTextFocus"               // 仅编辑器文本获得焦点时生效, 与 Ctrl+H 的作用范围一致.
    }
]
```

已有颜色不在当前色板时, 下次换色从首色开始. 单色色板保持该颜色; 空色板无法循环, 会显示错误通知并保留原规则, 新高亮没有可用色板颜色时仍使用 `textmarker.defaultHighlightColor`. 循环换色允许与其他规则共享颜色, 新规则分配仍优先选择未占用颜色.

## 原作者演示

以下三张动图沿用 [原项目](https://github.com/ryu1kn/vscode-text-marker) 的 MIT 资源, 展示基础高亮, 匹配模式和规则编辑. 新增十色菜单与样式配置见上文.

高亮与取消高亮 (原版行为):

第一张动图中的旧切换命令会在第二次调用时移除高亮. 从 1.13.0 起, **切换高亮颜色** 执行添加或循环换色; 取消请使用 **取消高亮** (推荐 Ctrl+Alt+H). 原动图也未展示固定十色子菜单与当前样式.

![原作者演示: 高亮与取消高亮](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.13.0/images/animations/public.gif)

大小写与整词匹配:

![原作者演示: 匹配模式](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.13.0/images/animations/ignore-case-and-whole-match.gif)

编辑已有规则:

![原作者演示: 编辑高亮规则](https://raw.githubusercontent.com/luck-gh/vscode-text-marker/v1.13.0/images/animations/update-highlight.gif)

## 开发, 反馈与许可

- [提交问题](https://github.com/luck-gh/vscode-text-marker/issues).
- [构建与测试说明](https://github.com/luck-gh/vscode-text-marker/blob/v1.13.0/CONTRIBUTING.md), 包含编译, 模拟测试和隔离的三语真实宿主验收.
- [更新记录](https://github.com/luck-gh/vscode-text-marker/blob/v1.13.0/CHANGELOG.md).
- [MIT 许可证](https://github.com/luck-gh/vscode-text-marker/blob/v1.13.0/LICENSE.txt), 保留 `Copyright (c) 2016 Ryuichi Inagaki`.
