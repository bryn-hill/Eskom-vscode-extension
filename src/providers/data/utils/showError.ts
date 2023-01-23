import * as vscode from 'vscode';
export const showError = async (message: string, callback: () => void) => {
  const chosen = await vscode.window.showErrorMessage(message, 'Retry');
  if (chosen === 'Retry') {
    callback();
  }
};
