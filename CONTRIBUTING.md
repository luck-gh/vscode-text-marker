
# How to Contribute

## Setting up dev environment

### Prerequisites

* Node.js version specified in [.nvmrc](./.nvmrc)
* Yarn for package manager: https://yarnpkg.com/

### Setup

```sh
yarn install
```

## Development

I'd love to see that tests are written to confirm the new behaviours.

You can run all checks (linting & testing) with `yarn run check`.

## Build

You can check what CI is checking at [.travis.yml](./.travis.yml).

## Commit messages

提交信息采用 `type: 中文说明`, 冒号后保留一个空格, 所有标点使用英文半角符号.
按完整逻辑变更组织提交, 不机械地逐文件提交. 常用类型:

- `feat`: 新增功能.
- `fix`: 修复错误.
- `refactor`: 不改变功能的代码重构.
- `test`: 新增或调整测试.
- `docs`: 文档和开发约定.
- `build`: 构建工具和依赖.
- `chore`: 其他维护工作.

例如: `feat: 增加高亮颜色菜单和自动语言切换`.
提交正文说明变更目的和实际验证结果. 不将个人用户配置或生成的安装包提交到源码仓库.

## Localized highlight controls

Use Node.js 24.12.0 and Yarn Classic 1.22.22 for the validated build environment.
If Yarn is not installed globally, run `npm exec --yes --package=yarn@1.22.22 -- yarn install --frozen-lockfile`.
Run `npm run check` for TypeScript compilation, linting and the full test suite.
The test suite uses a VS Code API stub; a passing test does not replace a manual extension-host UI check.

Menu and setting translations live in `package.nls*.json`; runtime translations live in `l10n/bundle.l10n*.json`.
Keep English, Simplified Chinese and Traditional Chinese keys in sync. Use `vscode.l10n.t` in runtime code.
Configuration keys and command identifiers must remain language-independent.

Package with `npm exec --yes --package=@vscode/vsce@4.0.0 -- vsce package --no-yarn` after validation.
The VSIX is for local testing until the publisher identity and distribution plan are confirmed.

## Real VS Code smoke test

After packaging, run `node scripts/host-smoke.cjs <package.vsix> <path-to-Code-executable> <locale>`
using Node.js 24 or later. Supported locales are `en`, `zh-cn` and `zh-tw`.
The script installs the VSIX into a fresh isolated profile, installs the official Chinese language pack
when needed, and starts a real extension host with a local renderer debugging port.
It checks ten rendered color menu items, literal array text navigation, live border/radius/opacity
changes including zero, localized regex and save prompts, and regex preservation after recoloring.
Screenshots, renderer styles, menu labels and the actual saved rule remain under ignored
`__host-smoke/`; failed runs are preserved. The test closes its own window automatically.
Personal VS Code profiles, settings and windows are not used by this test.

The Windows VS Code 1.108.2 English run has passed. The Simplified Chinese run currently
fails the actual display-locale assertion (`en` instead of `zh-cn`) despite the installed
language pack; Chinese host verification remains open. Translation resource/stub tests
do not replace this check.
