// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { loadProvider } from './selectProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const provider = loadProvider(context);
  if (!provider) {
    return;
  }

  let loadSheddingAlertCommand = vscode.commands.registerCommand(
    'eskom.loadSheddingAlert',
    provider.nextSlot
  );

  let loadSheddingSearchCommand = vscode.commands.registerCommand(
    'eskom.updateArea',
    provider.updateArea
  );

  provider.updateAlert();

  let intervalId = setInterval(provider.updateAlert, 3600000); // repeat every 60 mins

  context.subscriptions.push(
    loadSheddingAlertCommand,
    loadSheddingSearchCommand,
    {
      dispose: () => {
        clearInterval(intervalId);
      },
    }
  );
}

export function deactivate() {}
