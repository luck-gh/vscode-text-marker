import * as assert from 'assert';
import {some, none} from 'fp-ts/lib/Option';
import {task} from 'fp-ts/lib/Task';
import UpdateHighlightCommand from '../../../lib/commands/update-highlight';
import DecorationOperatorFactory from '../../../lib/decoration/decoration-operator-factory';
import DecorationOperator from '../../../lib/decoration/decoration-operator';
import DecorationRegistry from '../../../lib/decoration/decoration-registry';
import DecorationPicker from '../../../lib/decoration/decoration-picker';
import {Decoration} from '../../../lib/entities/decoration';
import PatternReader from '../../../lib/pattern-reader';
import StringPattern from '../../../lib/pattern/string';
import RegexPattern from '../../../lib/pattern/regex';
import TextLocationRegistry from '../../../lib/text-location-registry';
import TextEditor from '../../../lib/vscode/text-editor';
import {mockType} from '../../helpers/mock';

suite('UpdateHighlightCommand', () => {
    function harness(ids: string[], canceled = false) {
        const initial = new Decoration('original', new StringPattern({phrase: 'marker', wholeMatch: true}), '#5C8DFF');
        const replacement = new RegexPattern({phrase: 'mark.*', ignoreCase: true, wholeMatch: false});
        let picked = 0;
        let read = 0;
        const updates: Decoration[][] = [];
        const locations = new TextLocationRegistry();
        for (const id of ids) locations.register('editor', id, [{start: 0, end: 6}]);
        const command = new UpdateHighlightCommand(
            mockType<DecorationOperatorFactory>({createForVisibleEditors: () => mockType<DecorationOperator>({
                updateDecoration: (old: Decoration, updated: Decoration) => updates.push([old, updated])
            })}),
            mockType<DecorationRegistry>({inquireById: () => some(initial)}),
            mockType<PatternReader>({read: (pattern: any) => {
                assert.equal(pattern, initial.pattern);read++;
                return task.of(canceled ? none : some(replacement));
            }}), locations,
            mockType<DecorationPicker>({pick: () => {picked++;return task.of(canceled ? none : some(initial));}})
        );
        return {command, initial, updates, get picked() {return picked;}, get read() {return read;}};
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
