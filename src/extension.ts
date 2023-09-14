import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { escapeRegExp } from 'lodash';

const speedscopeViewType = 'speedscope';

const speedscopeWebRoot = 'media/speedscope';

const speedscopeResources = [
    'speedscope.e9450fa6.js',
    'reset.4d8f9039.css',
];

let speedscopePanel: vscode.WebviewPanel | undefined = undefined;

function showSpeedscopePanel(context: vscode.ExtensionContext) {
    if (!speedscopePanel) {
        speedscopePanel = vscode.window.createWebviewPanel(speedscopeViewType, 'Speedscope', vscode.ViewColumn.Beside, {
            enableScripts: true
        });

        speedscopePanel.webview.html = patchSpeedscopeResources(context, speedscopePanel, getSpeedscopeHTML(context));

        speedscopePanel.webview.onDidReceiveMessage(
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

        speedscopePanel.onDidDispose(
            () => {
                speedscopePanel = undefined;
            },
            undefined,
            context.subscriptions
        );
    }
    else {
        speedscopePanel.reveal();
    }

    return speedscopePanel;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "speedscope" is now active!');

    context.subscriptions.push(
        vscode.commands.registerCommand('speedscope.show', () => {
            showSpeedscopePanel(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('speedscope.open', async (uri: vscode.Uri) => {
            if (!uri) {
                return;
            }

            const panel = showSpeedscopePanel(context);
            panel.webview.postMessage({
                command: 'open',
                uri: panel.webview.asWebviewUri(uri).toString()
            });
        })
    );
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
        // convert to 0-based
        line = Math.max(0, line - 1);
        col = Math.max(0, col - 1);

        await vscode.window.showTextDocument(vscode.Uri.file(file), {
            viewColumn: vscode.ViewColumn.One,
            selection: new vscode.Selection(line, col, line, col)
        });
    }
    catch (e) {
        vscode.window.showErrorMessage(`Failed to open file ${file}: ${e}`);
    }
}

export function deactivate() { }
