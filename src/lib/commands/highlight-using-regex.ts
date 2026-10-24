import DecorationOperatorFactory from '../decoration/decoration-operator-factory';
import PatternReader from '../pattern-reader';
import PatternFactory from '../pattern/pattern-factory';
import {CommandLike} from '../vscode/vscode';
import MatchingModeRegistry from '../matching-mode-registry';
import WindowComponent from '../vscode/window';
import {getOptionM} from 'fp-ts/lib/OptionT';
import {task} from 'fp-ts/lib/Task';

export default class HighlightUsingRegexCommand implements CommandLike {
    private readonly decorationOperatorFactory: DecorationOperatorFactory;
    private readonly patternReader: PatternReader;
    private readonly patternFactory: PatternFactory;

    constructor(decorationOperatorFactory: DecorationOperatorFactory,
                matchingModeRegistry: MatchingModeRegistry,
                windowComponent: WindowComponent) {
        this.decorationOperatorFactory = decorationOperatorFactory;
        this.patternReader = new PatternReader(windowComponent);
        this.patternFactory = new PatternFactory(matchingModeRegistry);
    }

    execute() {
        return getOptionM(task).map(this.patternReader.read(this.patternFactory.create({type: 'RegExp', phrase: ''})), regex => {
            const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
            decorationOperator.addDecoration(regex);
        })();
    }
}
