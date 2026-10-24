import DecorationOperatorFactory from '../decoration/decoration-operator-factory';
import PatternFactory from '../pattern/pattern-factory';
import TextLocationRegistry from '../text-location-registry';
import TextEditor from '../vscode/text-editor';
import {CommandLike} from '../vscode/vscode';
import MatchingModeRegistry from '../matching-mode-registry';
import DecorationRegistry from '../decoration/decoration-registry';
import WindowComponent from '../vscode/window';
import {DecorationTypeRegistry} from '../decoration/decoration-type-registry';
import {pipe} from 'fp-ts/lib/pipeable';
import * as O from 'fp-ts/lib/Option';
import ConfigStore from '../config-store';
import {Decoration} from '../entities/decoration';
import {l10n} from 'vscode';

export default class ToggleHighlightCommand implements CommandLike {
    private readonly decorationOperatorFactory: DecorationOperatorFactory;
    private readonly patternFactory: PatternFactory;
    private readonly textLocationRegistry: TextLocationRegistry;

    constructor(matchingModeRegistry: MatchingModeRegistry,
                textLocationRegistry: TextLocationRegistry,
                private readonly decorationRegistry: DecorationRegistry,
                decorationTypeRegistry: DecorationTypeRegistry,
                windowComponent: WindowComponent,
                private readonly configStore: ConfigStore) {
        this.decorationOperatorFactory = new DecorationOperatorFactory(decorationRegistry, decorationTypeRegistry, textLocationRegistry, windowComponent);
        this.patternFactory = new PatternFactory(matchingModeRegistry);
        this.textLocationRegistry = textLocationRegistry;
    }

    execute(textEditor: TextEditor) {
        pipe(
            this.textLocationRegistry.queryDecorationId(textEditor.id, textEditor.selection),
            O.fold(
                () => this.addDecoration(textEditor),
                decorationId => pipe(this.decorationRegistry.inquireById(decorationId), O.map(d => this.cycleColour(d)))
            )
        );
    }

    private cycleColour(decoration: Decoration) {
        const colours = this.configStore.highlightColors;
        if (!colours.length) throw new Error(l10n.t('Add at least one color to textmarker.highlightColors before cycling highlight colors.'));
        // 不在当前色板中的颜色从第一色开始; 换色允许与其他规则共享颜色.
        const next = colours[(colours.indexOf(decoration.colour) + 1) % colours.length];
        this.decorationOperatorFactory.createForVisibleEditors().updateDecoration(decoration, decoration.withColour(next));
    }

    private addDecoration(textEditor: TextEditor) {
        if (!textEditor.selectedText) return;
        const pattern = this.patternFactory.create({phrase: textEditor.selectedText});
        const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
        const existing = this.decorationRegistry.inquireByPattern(pattern);
        if (O.isSome(existing)) this.cycleColour(existing.value);
        else decorationOperator.addDecoration(pattern);
    }

}
