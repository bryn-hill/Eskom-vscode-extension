import invariant from "tiny-invariant";
import * as vscode from "vscode";
import { SETTINGS } from "./settings.enum";

const showError = async (message: string, callback: () => void) => {
  const chosen = await vscode.window.showErrorMessage(message, "Try again");
  if (chosen === "Try again") {
    callback();
  }
};

export const updateArea = async () => {
  const area = await vscode.window.showInputBox({
    placeHolder: "Enter your area id (e.g. capetown-7-greenpoint)",
  });

  if (!area) {
    showError("Area cannot be empty", updateArea);
  }
  await vscode.workspace
    .getConfiguration()
    .update(SETTINGS.areaKey, area, vscode.ConfigurationTarget.Global);
};

export const updateToken = async () => {
  const token = await vscode.window.showInputBox({
    placeHolder: "Enter your token",
  });
  if (!token) {
    showError("API Token cannot be empty", updateToken);
    return;
  }

  await vscode.workspace
    .getConfiguration()
    .update(SETTINGS.tokenKey, token, vscode.ConfigurationTarget.Global);
};
