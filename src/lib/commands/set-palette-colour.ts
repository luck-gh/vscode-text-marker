import {l10n} from 'vscode';
import ConfigStore from '../config-store';
import WindowComponent from '../vscode/window';
import TextEditor from '../vscode/text-editor';
import {CommandLike} from '../vscode/vscode';
import SetHighlightColourCommand from './set-highlight-colour';

/** 菜单槽位只保存索引, 执行时读取当前色板, 不缓存旧颜色. */
export default class SetPaletteColourCommand implements CommandLike {
    constructor(private readonly index: number,
                private readonly configStore: ConfigStore,
                private readonly windowComponent: WindowComponent,
                private readonly createCommand: (colour: string) => SetHighlightColourCommand) {}

    execute(editor: TextEditor) {
        const palette = this.configStore.highlightColors;
        if (this.index >= palette.length) {
            return this.windowComponent.showErrorMessage(l10n.t('This palette color is no longer available. Check textmarker.highlightColors.'))();
        }
        this.createCommand(palette[this.index]).execute(editor);
    }
}
