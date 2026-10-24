import * as assert from 'assert';
import SetPaletteColourCommand from '../../../lib/commands/set-palette-colour';
import SetHighlightColourCommand from '../../../lib/commands/set-highlight-colour';
import ConfigStore from '../../../lib/config-store';
import WindowComponent from '../../../lib/vscode/window';
import TextEditor from '../../../lib/vscode/text-editor';
import {mockType} from '../../helpers/mock';

suite('SetPaletteColourCommand', () => {
    test('reads the current configured color after reordering, and rejects a removed slot', async () => {
        const config = mockType<ConfigStore>({highlightColors: ['#abcdef', 'hotpink', 'navy']});
        const colors: string[] = [];
        const errors: string[] = [];
        const command = new SetPaletteColourCommand(1, config,
            mockType<WindowComponent>({showErrorMessage: (message: string) => () => {errors.push(message);return Promise.resolve('');}}),
            color => mockType<SetHighlightColourCommand>({execute: () => colors.push(color)}));
        const editor = mockType<TextEditor>();
        await command.execute(editor);
        Object.assign(config, {highlightColors: ['navy', '#abcdef']});
        await command.execute(editor);
        Object.assign(config, {highlightColors: ['navy']});
        await command.execute(editor);
        assert.deepEqual(colors, ['hotpink', '#abcdef']);
        assert.equal(errors.length, 1);
        assert.ok(errors[0].startsWith('This palette color is no longer available.'));
    });
});
