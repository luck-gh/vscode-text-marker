import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {setTestLanguage} from '../stub-vscode';
import PatternReader from '../../lib/pattern-reader';
import RegexPattern from '../../lib/pattern/regex';
import {fakeInputBox} from '../helpers/input-box';
import WindowComponent from '../../lib/vscode/window';
import {mockType} from '../helpers/mock';

const root = path.resolve(__dirname, '../../..');
const read = (relative: string) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));

suite('Localization resources', () => {
    teardown(() => setTestLanguage('en'));
    test('provides complete static translations without changing command identifiers', () => {
        const manifest = read('package.json');
        const en = read('package.nls.json');
        const references = JSON.stringify(manifest).match(/%[^%]+%/g)!.map(match => match.slice(1, -1));
        assert.deepEqual([...new Set(references)].sort(), Object.keys(en).sort());
        for (const locale of ['zh-cn', 'zh-tw']) {
            const translated = read(`package.nls.${locale}.json`);
            assert.deepEqual(Object.keys(translated).sort(), Object.keys(en).sort());
            for (const value of Object.values(translated)) assert.ok(/[\u3400-\u9fff]/.test(value as string));
        }
        assert.ok(manifest.contributes.commands.some((item: any) => item.command === 'textmarker.toggleHighlight'));
        assert.equal(manifest.l10n, './l10n');
    });
    test('covers every runtime translation call in the source tree', () => {
        const keys = new Set<string>();
        function scan(directory: string): void {
            for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
                const file = path.join(directory, entry.name);
                if (entry.isDirectory()) scan(file);
                else if (entry.name.endsWith('.ts')) {
                    const content = fs.readFileSync(file, 'utf8');
                    const pattern = /l10n\.t\('([^']+)'\)/g;
                    let match: RegExpExecArray | null;
                    while ((match = pattern.exec(content)) !== null) keys.add(match[1]);
                }
            }
        }
        scan(path.join(root, 'src/lib'));
        const en = read('l10n/bundle.l10n.json');
        assert.deepEqual([...keys].sort(), Object.keys(en).sort());
        for (const locale of ['zh-cn', 'zh-tw']) {
            assert.deepEqual(Object.keys(read(`l10n/bundle.l10n.${locale}.json`)).sort(), Object.keys(en).sort());
        }
    });
    for (const [locale,regexTitle,errorText,editTitle] of [
        ['en', 'Enter matching text or a regular expression without enclosing / characters', 'Invalid regular expression.', 'Edit matching rule'],
        ['zh-cn', '输入匹配文本或正则表达式, 不需要两端的 /', '正则表达式无效', '修改匹配规则'],
        ['zh-tw', '輸入比對文字或規則運算式, 不需要兩端的 /', '規則運算式無效', '修改比對規則'],
        ['de', 'Enter matching text or a regular expression without enclosing / characters', 'Invalid regular expression.', 'Edit matching rule']
    ]) {
        test(`uses ${locale} or English fallback for prompts, validation and editing`, async () => {
            setTestLanguage(locale);
            const fake = fakeInputBox();
            const input = fake.input;
            const window = mockType<WindowComponent>({
                createInputBox: () => input
            });
            const pending = new PatternReader(window).read(new RegexPattern({phrase: 'a'}))();
            assert.equal(input.placeholder, regexTitle);
            for (const value of ['[', '(', '\\', 'a{2,1}']) {
                input.value = value;fake.events.emit('change', value);
                assert.ok(String(input.validationMessage).startsWith(errorText));
            }
            fake.events.emit('hide');
            await pending;
            assert.equal(input.title, editTitle);
        });
    }
});
