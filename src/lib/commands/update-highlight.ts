import {l10n} from 'vscode';
import DecorationOperatorFactory from '../decoration/decoration-operator-factory';
import DecorationRegistry from '../decoration/decoration-registry';
import DecorationPicker from '../decoration/decoration-picker';
import PatternReader from '../pattern-reader';
import TextLocationRegistry from '../text-location-registry';
import {CommandLike} from '../vscode/vscode';
import TextEditor from '../vscode/text-editor';
import {getOptionM} from 'fp-ts/lib/OptionT';
import {task} from 'fp-ts/lib/Task';

export default class UpdateHighlightCommand implements CommandLike {
    constructor(private readonly decorationOperatorFactory: DecorationOperatorFactory,
                private readonly decorationRegistry: DecorationRegistry,
                private readonly patternReader: PatternReader,
                private readonly textLocationRegistry: TextLocationRegistry,
                private readonly decorationPicker: DecorationPicker) {}

    execute(textEditor: TextEditor) {
        const ids = this.textLocationRegistry.queryDecorationIds(textEditor.id, textEditor.selection);
        const decoration = ids.length === 1
            ? task.of(this.decorationRegistry.inquireById(ids[0]))
            : this.decorationPicker.pick(l10n.t('Select a highlight to edit'));
        return getOptionM(task).chain(decoration, current =>
            getOptionM(task).map(this.patternReader.read(current.pattern), pattern => {
                const operator = this.decorationOperatorFactory.createForVisibleEditors();
                operator.updateDecoration(current, current.withPattern(pattern));
            })
        )();
    }
}
