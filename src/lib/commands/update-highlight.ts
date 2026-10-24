import {l10n} from 'vscode';
import ConfigStore from '../config-store';
import WindowComponent from '../vscode/window';
import DecorationOperatorFactory from '../decoration/decoration-operator-factory';
import DecorationRegistry from '../decoration/decoration-registry';
import DecorationPicker from '../decoration/decoration-picker';
import PatternFactory from '../pattern/pattern-factory';
import {Decoration} from '../entities/decoration';
import * as O from 'fp-ts/lib/Option';
import PatternReader from '../pattern-reader';
import TextLocationRegistry from '../text-location-registry';
import {CommandLike} from '../vscode/vscode';
import TextEditor from '../vscode/text-editor';
import {getOptionM} from 'fp-ts/lib/OptionT';
import {task, Task} from 'fp-ts/lib/Task';

export default class UpdateHighlightCommand implements CommandLike {
    constructor(private readonly decorationOperatorFactory: DecorationOperatorFactory,
                private readonly decorationRegistry: DecorationRegistry,
                private readonly patternReader: PatternReader,
                private readonly textLocationRegistry: TextLocationRegistry,
                private readonly decorationPicker: DecorationPicker,
                private readonly patternFactory: PatternFactory,
                private readonly configStore: ConfigStore,
                private readonly windowComponent: WindowComponent) {}

    execute(textEditor: TextEditor) {
        const ids = this.textLocationRegistry.queryDecorationIds(textEditor.id, textEditor.selection);
        const decoration: Task<O.Option<Decoration | 'create'>> = ids.length === 1
            ? task.of(this.decorationRegistry.inquireById(ids[0]))
            : this.decorationPicker.pickForEdit(l10n.t('Select a highlight to edit'));
        return getOptionM(task).chain(decoration, current =>
            getOptionM(task).map(this.patternReader.read(current === 'create'
                ? this.patternFactory.create({type: 'RegExp', phrase: ''}) : current.pattern), pattern => {
                if (current === 'create' && !this.configStore.highlightColors.length) {
                    this.windowComponent.showErrorMessage(l10n.t('Add at least one color to textmarker.highlightColors before adding a highlight rule.'))();
                    return;
                }
                const operator = this.decorationOperatorFactory.createForVisibleEditors();
                if (current === 'create') operator.addDecoration(pattern);
                else operator.updateDecoration(current, current.withPattern(pattern));
            })
        )();
    }
}
