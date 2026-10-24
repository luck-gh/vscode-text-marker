import * as Const from './const';
import CommandFactory from './command-factory';
import {ExtensionContextLike} from './vscode/vscode';
import {Logger} from './Logger';
import CommandComponent, {CommandItem} from './vscode/command';

export default class AppIntegrator {
    private readonly commandFactory: CommandFactory;
    private readonly vscode: any;
    private readonly commandComponent: CommandComponent;

    static create(vscode: any, logger: Logger) {
        const commandFactory = new CommandFactory(vscode, logger);
        const commandComponent = new CommandComponent(vscode.commands, logger);
        return new AppIntegrator(commandFactory, vscode, commandComponent);
    }

    constructor(commandFactory: CommandFactory, vscode: any, commandComponent: CommandComponent) {
        this.commandFactory = commandFactory;
        this.vscode = vscode;
        this.commandComponent = commandComponent;
    }

    async integrate(context: ExtensionContextLike) {
        this.registerCommands(context);
        this.registerEventListeners(context);
        this.vscode.workspace.onDidChangeConfiguration(async (event: import('vscode').ConfigurationChangeEvent) => {
            if (event.affectsConfiguration(`${Const.EXTENSION_ID}.highlightColors`)) {
                await this.updatePaletteMenu();
            }
            const styleKeys = ['borderWidth', 'borderStyle', 'borderRadius', 'defaultHighlightOpacity',
                'autoSelectDistinctiveTextColor', 'useHighlightColorOnRuler'];
            if (styleKeys.some(key => event.affectsConfiguration(`${Const.EXTENSION_ID}.${key}`))) {
                this.commandFactory.getDecorationOperatorFactory().createForVisibleEditors().refreshStyles();
            }
        }, undefined, context.subscriptions);
        await this.updatePaletteMenu();
        this.prepareExtensionEventsDrivenItems();
        this.broadcastReady();
    }

    private async updatePaletteMenu() {
        const count = this.commandFactory.getConfigStore().highlightColors.length;
        await Promise.all([
            this.vscode.commands.executeCommand('setContext', `${Const.EXTENSION_ID}.hasPaletteColors`, count > 0),
            ...Array.from({length: Const.PALETTE_MENU_SIZE}, (_, index) =>
                this.vscode.commands.executeCommand('setContext', `${Const.EXTENSION_ID}.paletteColor${index + 1}`, index < count))
        ]);
    }

    private registerEventListeners(context: ExtensionContextLike) {
        const autoRefreshDecoration = this.commandFactory.createAutoRefreshDecoration();
        this.vscode.window.onDidChangeActiveTextEditor(
            autoRefreshDecoration.execute, autoRefreshDecoration, context.subscriptions);

        const autoRefreshDecorationWithDelay = this.commandFactory.createAutoRefreshDecorationWithDelay();
        this.vscode.workspace.onDidChangeTextDocument(
            autoRefreshDecorationWithDelay.execute, autoRefreshDecorationWithDelay, context.subscriptions);
    }

    private registerCommands(context: ExtensionContextLike) {
        this.getCommands().forEach(command => {
            const disposable = this.commandComponent.registerCommand(command);
            context.subscriptions.push(disposable);
        });
    }

    private prepareExtensionEventsDrivenItems() {
        this.commandFactory.createSavedHighlightsRestorer();
        if (!this.commandFactory.getConfigStore().hideStatusBarItems) {
            this.commandFactory.createToggleCaseSensitivityModeButton();
            this.commandFactory.createToggleWholeMatchModeButton();
        }
    }

    private broadcastReady() {
        this.commandFactory.getEventBus().emit(Const.Event.EXTENSION_READY);
    }

    private getCommands(): CommandItem[] {
        const factory = this.commandFactory;
        return [
            ...Array.from({length: Const.PALETTE_MENU_SIZE}, (_, index) => ({
                name: `${Const.EXTENSION_ID}.paletteColor${index + 1}`,
                command: factory.createSetPaletteColourCommand(index),
                type: 'TEXT_EDITOR' as 'TEXT_EDITOR'
            })),
            {
                name: `${Const.EXTENSION_ID}.highlightUsingRegex`,
                command: factory.createHighlightUsingRegex(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.clearAllHighlight`,
                command: factory.createRemoveAllHighlightsCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.saveAllHighlights`,
                command: factory.createSaveAllHighlightsCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.toggleCaseSensitivity`,
                command: factory.createToggleCaseSensitivityCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.toggleModeForCaseSensitivity`,
                command: factory.createToggleCaseSensitivityModeCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.toggleWholeMatch`,
                command: factory.createToggleWholeMatchCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.toggleModeForWholeMatch`,
                command: factory.createToggleWholeMatchModeCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.unhighlight`,
                command: factory.createUnhighlightCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.goToNextHighlight`,
                command: factory.createGoToNextHighlightCommand(),
                type: 'TEXT_EDITOR'
            }, {
                name: `${Const.EXTENSION_ID}.goToPreviousHighlight`,
                command: factory.createGoToPreviousHighlightCommand(),
                type: 'TEXT_EDITOR'
            }, {
                name: `${Const.EXTENSION_ID}.toggleHighlight`,
                command: factory.createToggleHighlightCommand(),
                type: 'TEXT_EDITOR'
            }, {
                name: `${Const.EXTENSION_ID}.updateHighlight`,
                command: factory.createUpdateHighlightCommand(),
                type: 'TEXT_EDITOR'
            }
        ];
    }
}
