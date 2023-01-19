// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { updateAlert } from "./alerts";
import { nextSlot } from "./next-slot";
import { updateArea, updateToken } from "./update-settings";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  updateAlert();

  let intervalId = setInterval(updateAlert, 3600000); // repeat every 60 mins

  let loadsheddingAlertCommand = vscode.commands.registerCommand(
    "eskom.loadsheddingAlert",
    nextSlot
  );
  let updateAreaCommand = vscode.commands.registerCommand(
    "eskom.updateArea",
    updateArea
  );
  let updateTokenCommand = vscode.commands.registerCommand(
    "eskom.updateToken",
    updateToken
  );
  context.subscriptions.push(updateAreaCommand);
  context.subscriptions.push(updateTokenCommand);
  context.subscriptions.push(loadsheddingAlertCommand);
  context.subscriptions.push({
    dispose: () => {
      clearInterval(intervalId);
    },
  });
}

export function deactivate() {}
