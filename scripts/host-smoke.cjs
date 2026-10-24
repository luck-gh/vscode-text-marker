/* Real VS Code host and renderer smoke test. No mocked vscode API is used. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {spawn, spawnSync} = require('node:child_process');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const colors = ['Cyan', 'Blue', 'Yellow', 'Purple', 'Green', 'Red', 'Pink', 'Lime', 'Teal', 'Silver'];
const locales = {
    en: {menu: 'Set Highlight', regex: 'Enter matching text or a regular expression without enclosing / characters', save: 'Select where to save highlights'},
    'zh-cn': {menu: '设置高亮', regex: '输入匹配文本或正则表达式, 不需要两端的 /', save: '选择高亮的保存范围'},
    'zh-tw': {menu: '設定醒目提示', regex: '輸入比對文字或規則運算式, 不需要兩端的 /', save: '選擇醒目提示的儲存範圍'}
};
async function until(read, label, timeout = 45000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
        const value = await read();
        if (value) return value;
        await sleep(100);
    }
    throw new Error(`Timed out waiting for ${label}`);
}

// VS Code invokes this export in the real extension host.
exports.run = async () => {
    const vscode = require('vscode');
    const root = process.env.TEXT_MARKER_SMOKE_DIR;
    const report = value => fs.writeFileSync(path.join(root, 'stage.json'), JSON.stringify(value));
    const step = async name => {
        report({stage: name, language: vscode.env.language});
        await until(() => fs.existsSync(path.join(root, `${name}.continue`)), name);
    };
    try {
        if (process.env.TEXT_MARKER_SMOKE_BOOTSTRAP === '1') {
            await until(() => {
                const cache = path.join(root, 'user', 'languagepacks.json');
                return fs.existsSync(cache) && JSON.parse(fs.readFileSync(cache))[process.env.TEXT_MARKER_SMOKE_LOCALE];
            }, 'official language pack cache from initial workbench scan');
            report({stage: 'bootstrapped', language: vscode.env.language});
            return;
        }
        const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json')));
        const extension = vscode.extensions.getExtension(`${manifest.publisher}.${manifest.name}`);
        assert.ok(extension, 'Packaged extension is loaded');
        assert.equal(vscode.env.language, process.env.TEXT_MARKER_SMOKE_LOCALE, 'Actual VS Code display locale');
        await extension.activate();
        const commands = await vscode.commands.getCommands();
        for (let i = 1; i <= 30; i++) assert.ok(commands.includes(`textmarker.paletteColor${i}`));
        for (const color of colors) assert.ok(!commands.includes(`textmarker.highlight${color}`));
        const document = await vscode.workspace.openTextDocument(path.join(root, 'sample.txt'));
        const editor = await vscode.window.showTextDocument(document);
        const inheritedSettings = JSON.parse(fs.readFileSync(path.join(root, 'recommended-settings.json')));
        for (const [key, value] of Object.entries(inheritedSettings)) {
            assert.deepEqual(vscode.workspace.getConfiguration().get(key), value, 'Existing configuration: ' + key);
        }
        editor.selection = new vscode.Selection(1, 0, 1, 13);
        await vscode.commands.executeCommand('textmarker.goToNextHighlight');
        assert.equal(editor.selection.start.line, 1);
        assert.equal(editor.selection.start.character, 14, 'Restore an existing textmarker.savedHighlights rule under the new extension identity');
        assert.equal(editor.selection.end.character, 27);
        await vscode.commands.executeCommand('textmarker.clearAllHighlight');
        const select = () => {editor.selection = new vscode.Selection(0, 0, 0, 11);};
        const command = name => vscode.commands.executeCommand(`textmarker.${name}`);
        select();
        for (let i = 1; i <= colors.length; i++) await command(`paletteColor${i}`);
        for (let i = 0; i < colors.length + 1; i++) {
            await command('toggleHighlight');
            await step('cycle-' + i);
        }
        const palette = inheritedSettings['textmarker.highlightColors'];
        const settings = vscode.workspace.getConfiguration('textmarker');
        await settings.update('highlightColors', [], vscode.ConfigurationTarget.Global);
        await command('toggleHighlight');
        await step('empty-palette');
        await settings.update('highlightColors', palette, vscode.ConfigurationTarget.Global);
        report({stage: 'remove', language: vscode.env.language});
        await command('unhighlight');
        await step('removed');
        await command('toggleHighlight');
        await step('recreated');
        await command('paletteColor10');
        await command('goToNextHighlight');
        assert.equal(editor.selection.start.character, 24);
        assert.equal(editor.selection.end.character, 35);
        select();
        await step('styled');
        await vscode.commands.executeCommand('editor.action.showContextMenu');
        await step('menu');
        for (const [name, values] of [
            ['palette-two', ['#123456', '#abcdef']],
            ['palette-three', ['hotpink', 'navy', '#345678']],
            ['palette-shrunk', ['#345678', 'hotpink']],
            ['palette-empty', []]
        ]) {
            await settings.update('highlightColors', values, vscode.ConfigurationTarget.Global);
            select();
            await vscode.commands.executeCommand('editor.action.showContextMenu');
            await step(name);
        }
        await settings.update('highlightColors', palette, vscode.ConfigurationTarget.Global);
        select();
        await command('paletteColor10');
        await step('palette-restored');
        for (const [key, value] of Object.entries({borderWidth: 0, borderRadius: 0, defaultHighlightOpacity: 0})) {
            await settings.update(key, value, vscode.ConfigurationTarget.Global);
        }
        await step('transparent');
        for (const [key, value] of Object.entries({borderWidth: 2, borderRadius: 4, borderStyle: 'dashed', defaultHighlightOpacity: 0.4})) {
            await settings.update(key, value, vscode.ConfigurationTarget.Global);
        }
        await step('restyled');
        await command('clearAllHighlight');
        report({stage: 'regex', language: vscode.env.language});
        await command('highlightUsingRegex');
        await until(() => fs.existsSync(path.join(root, 'regex.continue')), 'regex UI submission');
        select();
        await command('toggleHighlight');
        await command('goToNextHighlight');
        assert.equal(editor.selection.start.character, 12, 'Regex still matches the other array index after recoloring');
        assert.equal(editor.selection.end.character, 23);
        report({stage: 'save', language: vscode.env.language});
        await command('saveAllHighlights');
        const saved = await until(() => {
            const value = vscode.workspace.getConfiguration('textmarker').get('savedHighlights');
            return value && value.length ? value : undefined;
        }, 'saved real host configuration');
        assert.equal(saved.length, 1);
        assert.deepEqual(saved[0], {pattern: {type: 'regex', expression: 'au8_data\\[\\d+\\]', ignoreCase: false, wholeMatch: false}, color: '#5C8DFF'});
        await step('saved');
        const originalSaved = JSON.parse(JSON.stringify(saved));
        const saveAndCheck = async (name, expected) => {
            report({stage: name, language: vscode.env.language});
            await command('saveAllHighlights');
            assert.deepEqual(vscode.workspace.getConfiguration('textmarker').get('savedHighlights'), expected);
            assert.equal(settings.get('enableIgnoreCase'), inheritedSettings['textmarker.enableIgnoreCase']);
            assert.equal(settings.get('enableWholeMatch'), inheritedSettings['textmarker.enableWholeMatch']);
        };
        select();
        report({stage: 'rule-cancel', language: vscode.env.language});
        await command('updateHighlight');
        await until(() => fs.existsSync(path.join(root, 'rule-cancel.continue')), 'rule-cancel UI completion');
        await saveAndCheck('save-cancel', originalSaved);
        select();
        report({stage: 'rule-to-string', language: vscode.env.language});
        await command('updateHighlight');
        await until(() => fs.existsSync(path.join(root, 'rule-to-string.continue')), 'rule-to-string UI completion');
        await command('goToNextHighlight');
        assert.equal(editor.selection.start.character, 24, 'Converted literal matches the same array index');
        assert.equal(editor.selection.end.character, 35);
        const literalSaved = [{pattern: {type: 'string', expression: 'au8_data[0]', ignoreCase: true, wholeMatch: true}, color: '#5C8DFF'}];
        await saveAndCheck('save-string', literalSaved);
        select();
        report({stage: 'rule-to-regex', language: vscode.env.language});
        await command('updateHighlight');
        await until(() => fs.existsSync(path.join(root, 'rule-to-regex.continue')), 'rule-to-regex UI completion');
        await command('goToNextHighlight');
        assert.equal(editor.selection.start.character, 12, 'Converted regex matches the other array index');
        assert.equal(editor.selection.end.character, 23);
        await saveAndCheck('save-regex', originalSaved);
        await step('rule-verified');
        await command('clearAllHighlight');
        report({stage: 'complete', language: vscode.env.language, extension: extension.id, version: extension.packageJSON.version, extensionPath: extension.extensionPath, configurationContinuity: true, saved});
    } catch (error) {
        report({stage: 'failed', message: error.stack});
        throw error;
    }
};

class DevTools {
    constructor(url) {
        this.socket = new WebSocket(url);
        this.sequence = 0;
        this.pending = new Map();
        this.socket.addEventListener('close', () => {for (const value of this.pending.values()) value.reject(new Error('DevTools connection closed'));});
        this.socket.addEventListener('message', event => {
            const message = JSON.parse(event.data);
            if (!message.id) return;
            const pending = this.pending.get(message.id);
            if (!pending) return;
            this.pending.delete(message.id);
            if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
            else pending.resolve(message.result);
        });
    }
    async open() {await new Promise((resolve, reject) => {this.socket.addEventListener('open', resolve, {once: true});this.socket.addEventListener('error', reject, {once: true});});}
    call(method, params = {}) {
        const id = ++this.sequence;
        return new Promise((resolve, reject) => {const timer = setTimeout(() => {this.pending.delete(id);reject(new Error('DevTools timed out: ' + method));}, 15000);this.pending.set(id, {resolve: value => {clearTimeout(timer);resolve(value);}, reject: error => {clearTimeout(timer);reject(error);}});this.socket.send(JSON.stringify({id, method, params}));});
    }
    async evaluate(expression) {
        const result = await this.call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
        if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
    }
    async key(key, code, windowsVirtualKeyCode) {
        await this.call('Input.dispatchKeyEvent', {type: 'keyDown', key, code, windowsVirtualKeyCode});
        await this.call('Input.dispatchKeyEvent', {type: 'keyUp', key, code, windowsVirtualKeyCode});
    }
    async screenshot(file) {const result = await this.call('Page.captureScreenshot', {format: 'png'});fs.writeFileSync(file, Buffer.from(result.data, 'base64'));}
}

async function main() {
    const [vsix, codeExe, locale = 'en'] = process.argv.slice(2);
    assert.ok(vsix && codeExe, 'Usage: node scripts/host-smoke.cjs package.vsix path/to/Code.exe [en|zh-cn|zh-tw]');
    assert.ok(locales[locale], `Unsupported test locale: ${locale}`);
    const manifest = require(path.resolve(__dirname, '..', 'package.json'));
    const json5 = require('json5');
    const readme = fs.readFileSync(path.resolve(__dirname, '..', 'README.md'), 'utf8').replace(/\r\n/g, '\n');
    const recommended = json5.parse(readme.match(/```jsonc\n([\s\S]*?)\n```/)[1]);
    const inheritedSettings = {...recommended, 'textmarker.savedHighlights': [{
        pattern: {type: 'string', expression: 'legacy_marker', ignoreCase: false, wholeMatch: true}, color: '#C0FFEE'
    }]};
    const root = path.resolve(__dirname, '..', '__host-smoke', new Date().toISOString().replace(/[:.]/g, '-') + '-' + locale);
    assert.ok(!fs.existsSync(root), `Evidence already exists: ${root}. Preserve it and use a fresh test directory.`);
    fs.mkdirSync(path.join(root, 'user', 'User'), {recursive: true});
    const extensions = path.join(root, 'extensions');
    fs.mkdirSync(extensions);
    fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest));
    fs.writeFileSync(path.join(root, 'sample.txt'), 'au8_data[0] au8_data[1] au8_data[0] au8_data[0\nlegacy_marker legacy_marker\n');
    fs.writeFileSync(path.join(root, 'recommended-settings.json'), JSON.stringify(inheritedSettings));
    fs.writeFileSync(path.join(root, 'user', 'User', 'settings.json'), JSON.stringify({
        'telemetry.telemetryLevel': 'off',
        ...inheritedSettings, 'workbench.startupEditor': 'none',
        'window.restoreWindows': 'none', 'update.mode': 'none', 'extensions.autoCheckUpdates': false,
        'extensions.autoUpdate': false, 'window.menuStyle': 'custom', 'editor.minimap.enabled': false, 'editor.fontSize': 22
    }));
    const environment = {...process.env, TEXT_MARKER_SMOKE_DIR: root, TEXT_MARKER_SMOKE_LOCALE: locale};
    delete environment.ELECTRON_RUN_AS_NODE;
    const install = spawnSync(codeExe, [path.join(path.dirname(codeExe), 'resources', 'app', 'out', 'cli.js'), '--user-data-dir', path.join(root, 'user'), '--extensions-dir', extensions, '--install-extension', path.resolve(vsix), '--force'], {encoding: 'utf8', env: {...environment, ELECTRON_RUN_AS_NODE: '1'}, windowsHide: true});
    // Code.exe needs the official CLI entrypoint when ELECTRON_RUN_AS_NODE is set.
    if (install.status !== 0) throw new Error(`Install failed: ${install.stdout}\n${install.stderr}`);
    if (locale !== 'en') {
        const languagePack = locale === 'zh-cn' ? 'MS-CEINTL.vscode-language-pack-zh-hans' : 'MS-CEINTL.vscode-language-pack-zh-hant';
        const languageInstall = spawnSync(codeExe, [path.join(path.dirname(codeExe), 'resources', 'app', 'out', 'cli.js'), '--user-data-dir', path.join(root, 'user'), '--extensions-dir', extensions, '--install-extension', languagePack], {encoding: 'utf8', env: {...environment, ELECTRON_RUN_AS_NODE: '1'}, windowsHide: true});
        assert.equal(languageInstall.status, 0, 'Official language pack installation: ' + languageInstall.stdout + languageInstall.stderr);
    }
    const installed = fs.readdirSync(extensions).find(name => name === `${manifest.publisher}.${manifest.name}-${manifest.version}`);
    assert.ok(installed, `Expected installed package ${manifest.publisher}.${manifest.name}-${manifest.version}: ${install.stdout}`);
    const port = 9381 + Object.keys(locales).indexOf(locale);
    const args = ['--user-data-dir', path.join(root, 'user'), '--extensions-dir', extensions,
        '--extensionDevelopmentPath=' + path.join(extensions, installed), '--extensionTestsPath=' + __filename,
        '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes', '--locale=' + locale,
        '--remote-debugging-port=' + port, '--disable-gpu'];
    if (locale !== 'en') {
        // The official CLI installs the pack before workbench has generated languagepacks.json.
        const bootstrap = spawnSync(codeExe, [...args.filter(arg => !arg.startsWith('--remote-debugging-port='))], {encoding: 'utf8', env: {...environment, TEXT_MARKER_SMOKE_BOOTSTRAP: '1'}, windowsHide: true, timeout: 60000});
        fs.writeFileSync(path.join(root, 'bootstrap.log'), (bootstrap.stdout || '') + (bootstrap.stderr || ''));
        assert.equal(bootstrap.status, 0, 'Initial workbench language-pack scan: ' + bootstrap.stderr);
        assert.ok(JSON.parse(fs.readFileSync(path.join(root, 'user', 'languagepacks.json')))[locale]);
    }
    const log = fs.openSync(path.join(root, 'code.log'), 'w');
    const processHandle = spawn(codeExe, args, {env: environment, windowsHide: true, stdio: ['ignore', log, log]});
    let exited = false;
    const completion = new Promise(resolve => processHandle.once('exit', code => {exited = true;resolve(code);}));
    const target = await until(async () => {
        try {const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();return list.find(item => item.type === 'page');}
        catch (error) {if (error instanceof TypeError && !exited) return;throw error;}
    }, 'VS Code renderer debugging endpoint');
    const cdp = new DevTools(target.webSocketDebuggerUrl);
    await cdp.open();
    const stage = name => until(() => {
        if (!fs.existsSync(path.join(root, 'stage.json'))) return;
        const value = JSON.parse(fs.readFileSync(path.join(root, 'stage.json')));
        if (value.stage === 'failed') throw new Error(value.message);
        if (value.stage === name) return value;
        if (exited) throw new Error('VS Code exited before ' + name);
    }, name);
    const release = name => fs.writeFileSync(path.join(root, `${name}.continue`), '');
    const expected = locales[locale];
    await stage('cycle-0');
    await cdp.evaluate(`window.__textMarkerQuery = function query(selector, root = document) {const result = [...root.querySelectorAll(selector)];for (const element of root.querySelectorAll('*')) {if (element.shadowRoot) result.push(...query(selector, element.shadowRoot));}return result;}; true`);
    console.log('Real host assertions passed; checking rendered UI: ' + root);
    const styleExpression = `(() => [...document.querySelectorAll('.monaco-editor [class*="TextEditorDecorationType"]')].map(e => {const s=getComputedStyle(e);const r=e.getBoundingClientRect();return {className:e.className,x:r.x,y:r.y,width:r.width,height:r.height,background:s.backgroundColor,border:s.border,borderRadius:s.borderRadius};}))()`;
    const styles = {};
    const cycleEvidence = [];
    const palette = inheritedSettings['textmarker.highlightColors'];
    for (let i = 0; i < palette.length + 1; i++) {
        await stage('cycle-' + i);
        const rgba = require('color-rgba')(palette[i % palette.length]);
        const expectedBackground = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, 0.25)`;
        const rendered = await until(async () => {const value = await cdp.evaluate(styleExpression);return value.some(item => item.background === expectedBackground) && value;}, 'rendered palette color ' + i);
        cycleEvidence.push({color: palette[i % palette.length], rendered});
        if (i === palette.length) await cdp.screenshot(path.join(root, '00-cycled.png'));
        release('cycle-' + i);
    }
    fs.writeFileSync(path.join(root, 'cycle-evidence.json'), JSON.stringify(cycleEvidence, null, 2));
    await stage('empty-palette');
    const runtimeTranslations = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', locale === 'en' ? 'l10n/bundle.l10n.json' : `l10n/bundle.l10n.${locale}.json`)));
    const emptyPaletteText = runtimeTranslations['Add at least one color to textmarker.highlightColors before cycling highlight colors.'];
    await until(async () => cdp.evaluate(`window.__textMarkerQuery('.notification-list-item-message').some(e => e.textContent === ${JSON.stringify(emptyPaletteText)})`), 'visible localized empty palette error');
    assert.ok((await cdp.evaluate(styleExpression)).some(item => item.background === 'rgba(0, 188, 212, 0.25)'), 'Original highlight remains after empty palette error');
    await cdp.screenshot(path.join(root, '00-empty-palette-error.png'));
    release('empty-palette');
    await stage('remove');
    const removeText = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', locale === 'en' ? 'l10n/bundle.l10n.json' : `l10n/bundle.l10n.${locale}.json`)))['Select a highlight to remove'];
    await until(async () => cdp.evaluate(`document.querySelector('.quick-input-widget input')?.getAttribute('placeholder') === ${JSON.stringify(removeText)}`), 'localized removal picker');
    await cdp.screenshot(path.join(root, '00-remove-picker.png'));
    await cdp.key('Enter', 'Enter', 13);
    await stage('removed');
    await until(async () => (await cdp.evaluate(styleExpression)).length === 0, 'all decorations removed by independent unhighlight');
    release('removed');
    await stage('recreated');
    await until(async () => (await cdp.evaluate(styleExpression)).some(item => item.background === 'rgba(0, 188, 212, 0.25)'), 'new highlight reuses released cyan');
    release('recreated');
    await stage('styled');
    styles.styled = await until(async () => {const value = await cdp.evaluate(styleExpression);return value.some(item => item.background === 'rgba(176, 190, 197, 0.25)') && value;}, 'rendered silver highlight');
    await cdp.screenshot(path.join(root, '01-highlight.png'));
    await cdp.call('Page.bringToFront');
    release('styled');
    await stage('menu');
    const menu = await until(async () => cdp.evaluate(`(() => {const e=[...window.__textMarkerQuery('.context-view .action-label')].find(e=>e.textContent.trim()===${JSON.stringify(expected.menu)});if(!e)return;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`), 'localized context submenu');
    await cdp.call('Input.dispatchMouseEvent', {type: 'mouseMoved', ...menu});
    await sleep(900);
    const allColorCommands = manifest.contributes.menus['textmarker.highlightColours'].map(item => item.command);
    const expectedColors = allColorCommands.slice(0, palette.length);
    const translations = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', locale === 'en' ? 'package.nls.json' : `package.nls.${locale}.json`)));
    const renderedLabels = await cdp.evaluate(`window.__textMarkerQuery('.context-view .action-label').map(e=>e.textContent)`);
    assert.ok(!renderedLabels.includes(translations['command.toggleHighlight']), 'Cycle command stays out of the context submenu');
    assert.equal(manifest.contributes.menus['editor/context'].length, 4);
    for (const command of ['updateHighlight', 'unhighlight', 'clearAllHighlight']) assert.ok(renderedLabels.includes(translations['command.' + command]));
    for (const command of expectedColors) {const entry = manifest.contributes.commands.find(item=>item.command === command);assert.ok(renderedLabels.includes(translations[entry.title.slice(1,-1)]), 'Rendered color menu: ' + command);}
    const labels = await cdp.evaluate(`JSON.stringify([...window.__textMarkerQuery('.context-view .action-label')].map(e=>e.textContent))`);
    fs.writeFileSync(path.join(root, 'menu-labels.json'), labels);
    await cdp.screenshot(path.join(root, '02-color-menu.png'));
    await cdp.key('Escape', 'Escape', 27);
    await cdp.key('Escape', 'Escape', 27);
    release('menu');
    const paletteEvidence = [];
    for (const [name, values] of [
        ['palette-two', ['#123456', '#abcdef']],
        ['palette-three', ['hotpink', 'navy', '#345678']],
        ['palette-shrunk', ['#345678', 'hotpink']],
        ['palette-empty', []]
    ]) {
        await stage(name);
        if (values.length) {
            const point = await until(async () => cdp.evaluate(`(() => {const e=[...window.__textMarkerQuery('.context-view .action-label')].find(e=>e.textContent.trim()===${JSON.stringify(expected.menu)});if(!e)return;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`), name + ' submenu');
            await cdp.call('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 5, y: 5});
            await cdp.call('Input.dispatchMouseEvent', {type: 'mouseMoved', ...point});
            const wanted = allColorCommands.slice(0, values.length).map(id => translations['command.' + id.split('.')[1]]);
            const allLabels = allColorCommands.map(id => translations['command.' + id.split('.')[1]]);
            const actual = await until(async () => cdp.evaluate(`(() => {const labels=window.__textMarkerQuery('.context-view .action-label').map(e=>e.textContent).filter(text=>${JSON.stringify(allLabels)}.includes(text));return labels.length===${values.length} && labels;})()`), name + ' exact color count');
            assert.deepEqual(actual, wanted);
            await cdp.screenshot(path.join(root, name + '.png'));
            const choice = await cdp.evaluate(`(() => {const e=window.__textMarkerQuery('.context-view .action-label').find(e=>e.textContent===${JSON.stringify(wanted[wanted.length - 1])});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
            await cdp.call('Input.dispatchMouseEvent', {type: 'mousePressed', button: 'left', clickCount: 1, ...choice});
            await cdp.call('Input.dispatchMouseEvent', {type: 'mouseReleased', button: 'left', clickCount: 1, ...choice});
            const rgba = require('color-rgba')(values[values.length - 1]);
            const background = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, 0.25)`;
            await until(async () => (await cdp.evaluate(styleExpression)).some(item => item.background === background), name + ' actual current-index color');
            paletteEvidence.push({name, configured: values, labels: actual, actualColor: values[values.length - 1]});
        } else {
            await until(async () => cdp.evaluate(`window.__textMarkerQuery('.context-view .action-label').some(e=>e.textContent===${JSON.stringify(translations['command.clearAllHighlight'])})`), 'empty palette remaining menu');
            assert.ok(!await cdp.evaluate(`window.__textMarkerQuery('.context-view .action-label').some(e=>e.textContent===${JSON.stringify(expected.menu)})`), 'Empty palette hides the color submenu');
            await cdp.screenshot(path.join(root, name + '.png'));
            await cdp.key('Escape', 'Escape', 27);
            paletteEvidence.push({name, configured: values, submenuHidden: true});
        }
        release(name);
    }
    await stage('palette-restored');
    await until(async () => (await cdp.evaluate(styleExpression)).some(item => item.background === 'rgba(176, 190, 197, 0.25)'), 'restored original palette color');
    fs.writeFileSync(path.join(root, 'palette-menu-evidence.json'), JSON.stringify(paletteEvidence, null, 2));
    release('palette-restored');
    await stage('transparent');
    styles.transparent = await until(async () => {const value = await cdp.evaluate(styleExpression);return value.some(item=>item.background==='rgba(176, 190, 197, 0)' && item.borderRadius==='0px' && item.border.startsWith('0px')) && value;}, 'transparent zero border and radius');
    await cdp.screenshot(path.join(root, '03-transparent.png'));
    release('transparent');
    await stage('restyled');
    styles.restyled = await until(async () => {const value = await cdp.evaluate(styleExpression);return value.some(item=>item.background==='rgba(176, 190, 197, 0.4)' && item.borderRadius==='4px' && item.border.includes('dashed') && parseFloat(item.border) > 0) && value;}, 'live changed style');
    await cdp.screenshot(path.join(root, '04-restyled.png'));
    release('restyled');
    await stage('regex');
    await until(async () => cdp.evaluate(`document.querySelector('.quick-input-widget input')?.getAttribute('placeholder') === ${JSON.stringify(expected.regex)}`), 'localized regex input');
    await cdp.screenshot(path.join(root, '05-regex-prompt.png'));
    await cdp.call('Input.insertText', {text: 'au8_data\\[\\d+\\]'});
    await cdp.key('Enter', 'Enter', 13);
    await until(async () => cdp.evaluate(`!document.querySelector('.quick-input-widget') || getComputedStyle(document.querySelector('.quick-input-widget')).display === 'none'`), 'regex input close');
    release('regex');
    await stage('save');
    await until(async () => cdp.evaluate(`document.querySelector('.quick-input-widget input')?.getAttribute('placeholder') === ${JSON.stringify(expected.save)}`), 'localized save picker');
    await cdp.screenshot(path.join(root, '06-save-picker.png'));
    await cdp.key('Enter', 'Enter', 13);
    await stage('saved');
    await cdp.screenshot(path.join(root, '07-regex-recolored.png'));
    fs.writeFileSync(path.join(root, 'rendered-styles.json'), JSON.stringify(styles, null, 2));
    release('saved');
    const translated = key => runtimeTranslations[key];
    const inputVisible = () => cdp.evaluate(`(() => {const e=document.querySelector('.quick-input-widget');return e && getComputedStyle(e).display !== 'none';})()`);
    const inputValue = () => cdp.evaluate(`document.querySelector('.quick-input-widget input').value`);
    const setInput = async text => {
        await cdp.evaluate(`(() => {const e=document.querySelector('.quick-input-widget input');e.focus();e.select();})()`);
        await cdp.call('Input.insertText', {text});
    };
    const assertModes = async (matchCase, regex, wholeMatch = false) => {
        const expectedState = [translated(matchCase ? 'Match case: On' : 'Match case: Off'), translated(regex ? 'Regular expression: On' : 'Regular expression: Off'), translated(wholeMatch ? 'Match whole words: On' : 'Match whole words: Off')];
        await until(async () => cdp.evaluate(`(() => {const text=document.querySelector('.quick-input-widget').textContent;return ${JSON.stringify(expectedState)}.every(value=>text.includes(value));})()`), 'visible matching-mode states');
    };
    const clickMode = async icon => {
        const before = await cdp.evaluate(`document.querySelector('.quick-input-message').textContent`);
        const point = await until(async () => cdp.evaluate(`(() => {const e=document.querySelector('.quick-input-widget .codicon-${icon}');if(!e)return;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`), 'native ' + icon + ' button');
        await cdp.call('Input.dispatchMouseEvent', {type: 'mousePressed', button: 'left', clickCount: 1, ...point});
        await cdp.call('Input.dispatchMouseEvent', {type: 'mouseReleased', button: 'left', clickCount: 1, ...point});
        await until(async () => cdp.evaluate(`document.querySelector('.quick-input-message').textContent !== ${JSON.stringify(before)}`), 'native mode button state update');
    };
    const openRule = async name => {
        await stage(name);
        await until(async () => cdp.evaluate(`document.querySelector('.quick-input-widget input')?.getAttribute('placeholder') === ${JSON.stringify(expected.regex)}`), 'unified rule input');
    };
    const acceptRule = async () => {
        await cdp.evaluate(`document.querySelector('.quick-input-widget input').focus()`);
        await cdp.key('Enter', 'Enter', 13);
        await until(async () => !await inputVisible(), 'accepted rule input close');
    };
    const acceptSave = async name => {
        await stage(name);
        await until(async () => cdp.evaluate(`document.querySelector('.quick-input-widget input')?.getAttribute('placeholder') === ${JSON.stringify(expected.save)}`), name + ' picker');
        await cdp.key('Enter', 'Enter', 13);
    };
    await openRule('rule-cancel');
    await assertModes(true, true);
    assert.equal(await inputValue(), 'au8_data\\[\\d+\\]');
    await cdp.screenshot(path.join(root, '08-unified-existing-regex.png'));
    await clickMode('case-sensitive');
    await clickMode('regex');
    await clickMode('whole-word');
    await assertModes(false, false, true);
    assert.equal(await inputValue(), 'au8_data\\[\\d+\\]', 'Mode changes preserve the full input text');
    await setInput('canceled draft');
    await cdp.key('Escape', 'Escape', 27);
    release('rule-cancel');
    await acceptSave('save-cancel');
    await openRule('rule-to-string');
    await assertModes(true, true);
    assert.equal(await inputValue(), 'au8_data\\[\\d+\\]', 'Esc preserved the original rule');
    await clickMode('regex');
    await clickMode('case-sensitive');
    await assertModes(false, false);
    await clickMode('whole-word');
    await assertModes(false, false, true);
    await setInput('au8_data[0]');
    await cdp.screenshot(path.join(root, '09-unified-literal.png'));
    await acceptRule();
    release('rule-to-string');
    await acceptSave('save-string');
    await openRule('rule-to-regex');
    await assertModes(false, false, true);
    assert.equal(await inputValue(), 'au8_data[0]');
    await clickMode('whole-word');
    await assertModes(false, false);
    await clickMode('case-sensitive');
    await clickMode('regex');
    await assertModes(true, true);
    await setInput('[');
    const errorText = translated('Invalid regular expression. Check brackets, escapes and quantifiers.');
    const hasError = () => cdp.evaluate(`document.querySelector('.quick-input-widget').textContent.includes(${JSON.stringify(errorText)})`);
    await until(hasError, 'live regex syntax error');
    await cdp.key('Enter', 'Enter', 13);
    assert.ok(await inputVisible(), 'Invalid regex cannot be submitted');
    await cdp.screenshot(path.join(root, '10-unified-invalid-regex.png'));
    await clickMode('regex');
    await assertModes(true, false);
    await until(async () => !await hasError(), 'literal mode clears regex error');
    assert.equal(await inputValue(), '[');
    await clickMode('regex');
    await until(hasError, 'regex mode restores syntax validation');
    await setInput('au8_data\\[\\d+\\]');
    await until(async () => !await hasError(), 'valid regex clears error');
    await cdp.screenshot(path.join(root, '11-unified-valid-regex.png'));
    await acceptRule();
    release('rule-to-regex');
    await acceptSave('save-regex');
    await stage('rule-verified');
    fs.writeFileSync(path.join(root, 'rule-input-evidence.json'), JSON.stringify({cancelPreservesRule: true, regexToLiteral: true, literalToRegex: true, caseToggle: true, wholeWordToggle: true, directRuleEditing: true, modeChangesPreserveText: true, invalidRegexBlocksAccept: true, literalModeClearsError: true, globalModesUnchanged: true}, null, 2));
    release('rule-verified');
    const result = await stage('complete');
    cdp.socket.close();
    const exitCode = await completion;
    assert.equal(exitCode, 0, 'Real extension host test exit');
    console.log(JSON.stringify({status: 'passed', locale, evidence: root, ...result}, null, 2));
}
if (require.main === module) main().catch(error => {console.error(error);process.exitCode = 1;});
