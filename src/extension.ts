import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { escapeRegExp } from 'lodash';

const speedscopeViewType = 'speedscope';

const speedscopeWebRoot = 'media/speedscope';

const speedscopeResources = [
    'speedscope.f27db165.js',
    'reset.8c46b7a1.css',
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "speedscope" is now active!');

    const disposable = vscode.commands.registerCommand('speedscope.showSpeedscope', () => {
        const panel = vscode.window.createWebviewPanel(speedscopeViewType, 'Speedscope', vscode.ViewColumn.Beside, {
            enableScripts: true
        });

        panel.webview.html = patchSpeedscopeResources(context, panel, getSpeedscopeHTML(context));
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

export function deactivate() { }
