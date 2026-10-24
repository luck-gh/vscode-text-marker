import * as assert from 'assert';
import {none} from 'fp-ts/lib/Option';
import {EventEmitter} from 'events';
import PatternReader from '../../lib/pattern-reader';
import StringPattern from '../../lib/pattern/string';
import RegexPattern from '../../lib/pattern/regex';
import MatchingModeRegistry from '../../lib/matching-mode-registry';
import WindowComponent from '../../lib/vscode/window';
import {assertOption} from '../helpers/assertions';
import {fakeInputBox} from '../helpers/input-box';
import {mockType} from '../helpers/mock';

suite('PatternReader', () => {
    test('switches literal text to regex and match-case without losing text or whole-word mode', async () => {
        const fake = fakeInputBox();
        const reader = new PatternReader(mockType<WindowComponent>({createInputBox: () => fake.input}));
        const original = new StringPattern({phrase: 'au8_data\\[\\d+\\]', ignoreCase: true, wholeMatch: true});
        const result = reader.read(original)();
        assert.ok(fake.input.prompt!.includes('Match case: Off'));
        assert.ok(fake.input.prompt!.includes('Regular expression: Off'));
        fake.events.emit('button', fake.input.buttons[0]);
        fake.events.emit('button', fake.input.buttons[2]);
        assert.equal(fake.input.value, original.phrase);
        assert.ok(fake.input.prompt!.includes('Match case: On'));
        assert.ok(fake.input.prompt!.includes('Regular expression: On'));
        fake.events.emit('accept');
        assertOption(await result, value => {
            assert.equal(value.type, 'RegExp');
            assert.equal(value.phrase, original.phrase);
            assert.equal(value.ignoreCase, false);
            assert.equal(value.wholeMatch, true);
        });
        assert.equal(original.type, 'String');
        assert.equal(original.ignoreCase, true);
        assert.ok(fake.disposed);
        assert.equal(fake.events.eventNames().length, 0);
    });

    test('invalid regex blocks acceptance, then literal mode clears the error and accepts the same text', async () => {
        const fake = fakeInputBox();
        const result = new PatternReader(mockType<WindowComponent>({createInputBox: () => fake.input}))
            .read(new RegexPattern({phrase: 'old', ignoreCase: false, wholeMatch: true}))();
        assert.ok(fake.input.prompt!.includes('Regular expression: On'));
        fake.input.value = '[';
        fake.events.emit('change', '[');
        assert.ok(String(fake.input.validationMessage).startsWith('Invalid regular expression.'));
        fake.events.emit('accept');
        assert.equal(fake.disposed, false);
        fake.events.emit('button', fake.input.buttons[2]);
        assert.equal(fake.input.validationMessage, undefined);
        assert.equal(fake.input.value, '[');
        fake.events.emit('accept');
        assertOption(await result, value => {
            assert.equal(value.type, 'String');
            assert.equal(value.phrase, '[');
            assert.equal(value.wholeMatch, true);
        });
    });

    test('applies the whole-word toggle only with the accepted draft', async () => {
        const fake = fakeInputBox();
        const initial = new StringPattern({phrase: 'marker', wholeMatch: false});
        const result = new PatternReader(mockType<WindowComponent>({createInputBox: () => fake.input})).read(initial)();
        assert.ok(fake.input.prompt!.includes('Match whole words: Off'));
        fake.events.emit('button', fake.input.buttons[1]);
        assert.ok(fake.input.prompt!.includes('Match whole words: On'));
        assert.equal(fake.input.value, 'marker');
        assert.equal(initial.wholeMatch, false);
        fake.events.emit('accept');
        assertOption(await result, pattern => assert.equal(pattern.wholeMatch, true));
    });

    test('rejects empty input, validates again on accept, and releases resources on cancellation', async () => {
        const fake = fakeInputBox();
        const initial = new RegexPattern({phrase: 'old', ignoreCase: true});
        const result = new PatternReader(mockType<WindowComponent>({createInputBox: () => fake.input})).read(initial)();
        fake.input.value = '';
        fake.events.emit('accept');
        assert.equal(fake.input.validationMessage, 'Enter matching text or a regular expression.');
        fake.input.value = '(';
        fake.events.emit('accept');
        assert.ok(String(fake.input.validationMessage).startsWith('Invalid regular expression.'));
        fake.events.emit('button', fake.input.buttons[0]);
        fake.events.emit('button', fake.input.buttons[1]);
        fake.events.emit('hide');
        assert.deepEqual(await result, none);
        assert.equal(initial.phrase, 'old');
        assert.equal(initial.ignoreCase, true);
        assert.ok(fake.disposed);
        assert.equal(fake.events.eventNames().length, 0);
    });

    test('uses the new-rule defaults without changing the global matching mode', async () => {
        const modes = new MatchingModeRegistry(true, true, new EventEmitter());
        const before = {...modes.mode};
        const fake = fakeInputBox();
        const result = new PatternReader(mockType<WindowComponent>({createInputBox: () => fake.input}))
            .read(new RegexPattern({phrase: 'a', ...modes.mode}))();
        fake.events.emit('button', fake.input.buttons[0]);
        fake.events.emit('button', fake.input.buttons[2]);
        fake.events.emit('accept');
        await result;
        assert.deepEqual(modes.mode, before);
    });
});
