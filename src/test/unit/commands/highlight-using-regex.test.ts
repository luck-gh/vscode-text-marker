import {mock, mockType, verify, when} from '../../helpers/mock';
import HighlightUsingRegexCommand from '../../../lib/commands/highlight-using-regex';
import DecorationOperatorFactory from '../../../lib/decoration/decoration-operator-factory';
import DecorationOperator from '../../../lib/decoration/decoration-operator';
import RegexPattern from '../../../lib/pattern/regex';
import MatchingModeRegistry from '../../../lib/matching-mode-registry';
import WindowComponent from '../../../lib/vscode/window';
import {fakeInputBox} from '../../helpers/input-box';

suite('HighlightUsingRegexCommand', () => {
    const matchingModeRegistry = mockType<MatchingModeRegistry>({mode: {ignoreCase: true, wholeMatch: true}});
    test('adds the accepted pattern with current matching defaults', async () => {
        const operator = mock(DecorationOperator);
        const factory = mock(DecorationOperatorFactory);
        when(factory.createForVisibleEditors()).thenReturn(operator);
        const fake = fakeInputBox(input => {input.value = 'pattern';fake.events.emit('accept');});
        const window = mockType<WindowComponent>({createInputBox: () => fake.input});
        await new HighlightUsingRegexCommand(factory, matchingModeRegistry, window).execute();
        verify(operator.addDecoration(new RegexPattern({phrase: 'pattern', ignoreCase: true, wholeMatch: true})));
    });
    test('does not add a rule on cancellation', async () => {
        const factory = mock(DecorationOperatorFactory);
        const fake = fakeInputBox(() => fake.events.emit('hide'));
        const window = mockType<WindowComponent>({createInputBox: () => fake.input});
        await new HighlightUsingRegexCommand(factory, matchingModeRegistry, window).execute();
        verify(factory.createForVisibleEditors(), {times: 0});
    });
});
