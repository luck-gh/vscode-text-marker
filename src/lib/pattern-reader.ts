import {Disposable, l10n, QuickInputButton, ThemeIcon} from 'vscode';
import {none, Option, some} from 'fp-ts/lib/Option';
import {Task} from 'fp-ts/lib/Task';
import WindowComponent from './vscode/window';
import Pattern from './pattern/pattern';
import RegexPattern from './pattern/regex';
import StringPattern from './pattern/string';

export default class PatternReader {
    constructor(private readonly windowComponent: WindowComponent) {}

    read(initial: Pattern): Task<Option<Pattern>> {
        return () => new Promise(resolve => {
            const input = this.windowComponent.createInputBox();
            let ignoreCase = initial.ignoreCase;
            let wholeMatch = initial.wholeMatch;
            let regex = initial.type === 'RegExp';
            const subscriptions: Disposable[] = [];
            const finish = (result: Option<Pattern>) => {
                subscriptions.forEach(subscription => subscription.dispose());
                input.dispose();
                resolve(result);
            };
            const validate = () => {
                input.validationMessage = this.validate(input.value, regex);
            };
            const refresh = () => {
                input.buttons = [
                    this.button('case-sensitive', ignoreCase
                        ? l10n.t('Match case: Off (click to turn on)')
                        : l10n.t('Match case: On (click to turn off)')),
                    this.button('whole-word', wholeMatch
                        ? l10n.t('Match whole words: On (click to turn off)')
                        : l10n.t('Match whole words: Off (click to turn on)')),
                    this.button('regex', regex
                        ? l10n.t('Regular expression: On (click to turn off)')
                        : l10n.t('Regular expression: Off (click to turn on)'))
                ];
                input.prompt = [
                    ignoreCase ? l10n.t('Match case: Off') : l10n.t('Match case: On'),
                    wholeMatch ? l10n.t('Match whole words: On') : l10n.t('Match whole words: Off'),
                    regex ? l10n.t('Regular expression: On') : l10n.t('Regular expression: Off')
                ].join(' | ');
                validate();
            };
            input.title = l10n.t('Edit matching rule');
            input.placeholder = l10n.t('Enter matching text or a regular expression without enclosing / characters');
            input.value = initial.phrase;
            subscriptions.push(
                input.onDidChangeValue(validate),
                input.onDidTriggerButton(button => {
                    if (button === input.buttons[0]) ignoreCase = !ignoreCase;
                    else if (button === input.buttons[1]) wholeMatch = !wholeMatch;
                    else regex = !regex;
                    refresh();
                }),
                input.onDidAccept(() => {
                    validate();
                    if (input.validationMessage) return;
                    const params = {phrase: input.value, ignoreCase, wholeMatch};
                    finish(some(regex ? new RegexPattern(params) : new StringPattern(params)));
                }),
                input.onDidHide(() => finish(none))
            );
            refresh();
            input.show();
        });
    }

    private button(icon: string, tooltip: string): QuickInputButton {
        return {iconPath: new ThemeIcon(icon), tooltip};
    }

    private validate(value: string, regex: boolean): string | undefined {
        if (!value) return l10n.t('Enter matching text or a regular expression.');
        if (regex) {
            try {
                RegExp(value);
            } catch (error) {
                if (!(error instanceof SyntaxError)) throw error;
                return l10n.t('Invalid regular expression. Check brackets, escapes and quantifiers.');
            }
        }
        return undefined;
    }
}
