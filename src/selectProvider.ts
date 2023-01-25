import * as vscode from 'vscode';
import { EskomSePushProvider } from './providers/data/eskom-se-push/Eskom-se-push';
import { EskomProvider } from './providers/data/eskom/eskom';
import { SETTINGS } from './settings.enum';
enum DataSource {
  eskom = 'Eskom',
  eskomSePush = 'EskomSePush',
  sintrex = 'Sintrex'
}

export function loadProvider(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration();

  const provider = config.get(SETTINGS.provider) as DataSource | undefined;
  switch (provider) {
    case DataSource.eskom:
      // call function to get data from Eskom
      return new EskomProvider(context);

    case DataSource.eskomSePush:
      return new EskomSePushProvider(context);

    case DataSource.sintrex:
      // call function to get data from Sintrex
      throw new Error('Not yet implemented');
    default:
      vscode.window.showErrorMessage('Invalid provider');
  }
}
