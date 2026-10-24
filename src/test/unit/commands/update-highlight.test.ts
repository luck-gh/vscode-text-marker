import * as assert from 'assert';
import {some, none} from 'fp-ts/lib/Option';
import {task} from 'fp-ts/lib/Task';
import ConfigStore from '../../../lib/config-store';
import WindowComponent from '../../../lib/vscode/window';
import UpdateHighlightCommand from '../../../lib/commands/update-highlight';
import DecorationOperatorFactory from '../../../lib/decoration/decoration-operator-factory';
import DecorationOperator from '../../../lib/decoration/decoration-operator';
import DecorationRegistry from '../../../lib/decoration/decoration-registry';
import DecorationPicker from '../../../lib/decoration/decoration-picker';
import {Decoration} from '../../../lib/entities/decoration';
import PatternFactory from '../../../lib/pattern/pattern-factory';
import MatchingModeRegistry from '../../../lib/matching-mode-registry';
import PatternReader from '../../../lib/pattern-reader';
import StringPattern from '../../../lib/pattern/string';
import RegexPattern from '../../../lib/pattern/regex';
import TextLocationRegistry from '../../../lib/text-location-registry';
import TextEditor from '../../../lib/vscode/text-editor';
import {mockType} from '../../helpers/mock';

suite('UpdateHighlightCommand', () => {
    function harness(ids: string[], canceled = false, create = false) {
        const initial = new Decoration('original', new StringPattern({phrase: 'marker', wholeMatch: true}), '#5C8DFF');
        const replacement = new RegexPattern({phrase: 'mark.*', ignoreCase: true, wholeMatch: false});
        let picked = 0;
        let read = 0;
        const updates: Decoration[][] = [];
        const additions: any[] = [];
        const errors: string[] = [];
        const config = mockType<ConfigStore>({highlightColors: ['#00BCD4']});
        const locations = new TextLocationRegistry();
        for (const id of ids) locations.register('editor', id, [{start: 0, end: 6}]);
        const command = new UpdateHighlightCommand(
            mockType<DecorationOperatorFactory>({createForVisibleEditors: () => mockType<DecorationOperator>({
                updateDecoration: (old: Decoration, updated: Decoration) => updates.push([old, updated]),
                addDecoration: (pattern: any) => additions.push(pattern)
            })}),
            mockType<DecorationRegistry>({inquireById: () => some(initial)}),
            mockType<PatternReader>({read: (pattern: any) => {
                if (create) {
                    assert.equal(pattern.type, 'RegExp');
                    assert.equal(pattern.phrase, '');
                    assert.equal(pattern.ignoreCase, false);
                    assert.equal(pattern.wholeMatch, false);
                } else assert.equal(pattern, initial.pattern);
                read++;
                return task.of(canceled ? none : some(replacement));
            }}), locations,
            mockType<DecorationPicker>({pickForEdit: () => {picked++;return task.of(canceled && !create ? none : some(create ? 'create' : initial));}}),
            new PatternFactory(mockType<MatchingModeRegistry>({mode: {ignoreCase: false, wholeMatch: false}})), config,
            mockType<WindowComponent>({showErrorMessage: (message: string) => () => {errors.push(message);return Promise.resolve('');}})
        );
        return {command, initial, updates, additions, config, errors, get picked() {return picked;}, get read() {return read;}};
    }
    const editor = mockType<TextEditor>({id: 'editor', selection: {start: 0, end: 6}});
    test('opens the uniquely matched rule directly and preserves its identity and color', async () => {
        const h = harness(['original']);
        await h.command.execute(editor);
        assert.equal(h.picked, 0);
        assert.equal(h.read, 1);
        assert.equal(h.updates.length, 1);
        const [old, updated] = h.updates[0];
        assert.equal(old, h.initial);
        assert.equal(updated.id, old.id);
        assert.equal(updated.colour, old.colour);
        assert.equal(updated.pattern.type, 'RegExp');
        assert.equal(updated.pattern.ignoreCase, true);
        assert.equal(updated.pattern.wholeMatch, false);
    });
    for (const ids of [[], ['first', 'overlapping']]) {
        test(`picks the rule when the selection identifies ${ids.length} rules`, async () => {
            const h = harness(ids);
            await h.command.execute(editor);
            assert.equal(h.picked, 1);
            assert.equal(h.read, 1);
            assert.equal(h.updates.length, 1);
        });
    }
    test('creates a rule through the existing default regex input after choosing Add rule', async () => {
        const h = harness([], false, true);
        await h.command.execute(editor);
        assert.equal(h.picked, 1);
        assert.equal(h.read, 1);
        assert.equal(h.updates.length, 0);
        assert.equal(h.additions.length, 1);
        assert.equal(h.additions[0].phrase, 'mark.*');
    });
    test('does not allocate a rule or color when creation input is canceled', async () => {
        const h = harness([], true, true);
        await h.command.execute(editor);
        assert.equal(h.read, 1);
        assert.equal(h.additions.length, 0);
        assert.equal(h.updates.length, 0);
    });
    test('rejects creation for an empty current palette and can create after it is restored', async () => {
        const h = harness([], false, true);
        h.config.highlightColors.length = 0;
        await h.command.execute(editor);
        assert.equal(h.additions.length, 0);
        assert.equal(h.updates.length, 0);
        assert.deepEqual(h.errors, ['Add at least one color to textmarker.highlightColors before adding a highlight rule.']);
        h.config.highlightColors.push('#00BCD4');
        await h.command.execute(editor);
        assert.equal(h.additions.length, 1);
    });
    test('canceled creation with an empty palette does not notify or allocate', async () => {
        const h = harness([], true, true);
        h.config.highlightColors.length = 0;
        await h.command.execute(editor);
        assert.equal(h.additions.length, 0);
        assert.equal(h.errors.length, 0);
    });
    test('allows editing an existing rule while its configured palette is empty', async () => {
        const h = harness(['original']);
        h.config.highlightColors.length = 0;
        await h.command.execute(editor);
        assert.equal(h.updates.length, 1);
        assert.equal(h.errors.length, 0);
        assert.equal(h.updates[0][1].colour, h.initial.colour);
    });
    test('leaves the existing rule untouched on input cancellation', async () => {
        const h = harness(['original'], true);
        await h.command.execute(editor);
        assert.equal(h.updates.length, 0);
        assert.equal(h.initial.pattern.phrase, 'marker');
    });
    test('does not open an editor when the rule picker is canceled', async () => {
        const h = harness([], true);
        await h.command.execute(editor);
        assert.equal(h.read, 0);
        assert.equal(h.updates.length, 0);
    });
});
