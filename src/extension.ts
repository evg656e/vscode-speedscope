import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { escapeRegExp } from 'lodash';

const speedscopeViewType = 'speedscope';

const speedscopeWebRoot = 'media/speedscope';

const speedscopeResources = [
    'speedscope.179feffa.js',
    'reset.4d8f9039.css',
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "speedscope" is now active!');

    const disposable = vscode.commands.registerCommand('speedscope.showSpeedscope', () => {
        const panel = vscode.window.createWebviewPanel(speedscopeViewType, 'Speedscope', vscode.ViewColumn.Beside, {
            enableScripts: true
        });

        panel.webview.html = patchSpeedscopeResources(context, panel, getSpeedscopeHTML(context));

        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'jumpTo':
                        await jumpTo(message.file, message.line, message.col);
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function fileUri(...paths: string[]): vscode.Uri {
    return vscode.Uri.file(path.join(...paths));
}

function patchSpeedscopeResources(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, speedscopeHTML: string) {
    const resPattern = speedscopeResources.map(resource => escapeRegExp(resource)).join('|');
    const resRegex = new RegExp(resPattern, 'g');

    return speedscopeHTML.replace(resRegex, (res) => {
        const resUri = fileUri(context.extensionPath, speedscopeWebRoot, res);
        return panel.webview.asWebviewUri(resUri).toString();
    });
}

function getSpeedscopeHTML(context: vscode.ExtensionContext) {
    const onDiskPath = fileUri(context.extensionPath, speedscopeWebRoot, 'index.html');
    return fs.readFileSync(onDiskPath.fsPath, 'utf8');
}

async function jumpTo(file: string, line: number, col: number) {
    try {
        const document = await vscode.workspace.openTextDocument(file);
        const editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One);

        // convert to 0-based
        line = Math.max(0, line - 1);
        col = Math.max(0, col - 1);

        const position = new vscode.Position(line, col);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
    }
    catch (e) {
        vscode.window.showErrorMessage(`Failed to open file ${file}: ${e}`);
    }
}

export function deactivate() { }
