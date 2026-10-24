import * as O from 'fp-ts/lib/Option';
import {getOptionM} from 'fp-ts/lib/OptionT';
import {task, Task} from 'fp-ts/lib/Task';
import * as vscode from 'vscode';
import ConfigurationTargetPicker from './config-target-picker';
import * as Const from './const';
import {Highlight} from './entities/highlight';

const rgba = require('color-rgba');

export default class ConfigStore {
    private readonly workspace: typeof vscode.workspace;
    private readonly configTargetPicker: ConfigurationTargetPicker;

    constructor(workspace: typeof vscode.workspace, configTargetPicker: ConfigurationTargetPicker) {
        this.workspace = workspace;
        this.configTargetPicker = configTargetPicker;
    }

    get highlightColors() {
        const colours = this.get<string[]>('highlightColors');
        if (!Array.isArray(colours) || colours.some(colour => typeof colour !== 'string' || !rgba(colour).length)) {
            throw new Error(vscode.l10n.t('textmarker.highlightColors must contain valid CSS colors.'));
        }
        return colours;
    }

    get defaultHighlightColor() {
        return this.get<string>('defaultHighlightColor');
    }

    get defaultHighlightOpacity() {
        return this.get<number>('defaultHighlightOpacity');
    }

    get borderWidth() {
        return this.get<number>('borderWidth');
    }

    get borderStyle() {
        return this.get<string>('borderStyle');
    }

    get borderRadius() {
        return this.get<number>('borderRadius');
    }

    get savedHighlights() {
        return this.get<Highlight[]>('savedHighlights');
    }

    get delayForRefreshingHighlight() {
        return this.get<number>('delayForRefreshingHighlight');
    }

    get useHighlightColorOnRuler() {
        return this.get<boolean>('useHighlightColorOnRuler');
    }

    get autoSelectDistinctiveTextColor() {
        return this.get<boolean>('autoSelectDistinctiveTextColor');
    }

    get enableIgnoreCase() {
        return this.get<boolean>('enableIgnoreCase');
    }

    get enableWholeMatch() {
        return this.get<boolean>('enableWholeMatch');
    }

    get hideStatusBarItems() {
        return this.get<boolean>('hideStatusBarItems');
    }

    private get<T>(configName: string) {
        const extensionConfig = this.workspace.getConfiguration(Const.EXTENSION_ID);
        return extensionConfig.get(configName) as T;
    }

    set(configName: string, configValue: any): Task<O.Option<never>> {
        return getOptionM(task).chain(this.configTargetPicker.pick(), target => {
            const extensionConfig = this.workspace.getConfiguration(Const.EXTENSION_ID);
            return () => extensionConfig.update(configName, configValue, target) as Promise<O.Option<never>>;
        });
    }
}
