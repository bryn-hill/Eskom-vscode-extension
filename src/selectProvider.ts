import * as vscode from 'vscode';
import { EskomSePushProvider } from './providers/data/eskom-se-push/Eskom-se-push';
import { EskomProvider } from './providers/data/eskom/eskom';
import { SETTINGS } from './settings.enum';
enum DataSource {
  Eskom = 'Eskom',
  EskomSePush = 'EskomSePush',
  Sintrex = 'Sintrex',
}

export function loadProvider(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration();

  const provider = config.get(SETTINGS.provider) as DataSource | undefined;
  switch (provider) {
    case DataSource.Eskom:
      // call function to get data from Eskom
      return new EskomProvider(context);

    case DataSource.EskomSePush:
      return new EskomSePushProvider(context);

    case DataSource.Sintrex:
      // call function to get data from Sintrex
      throw new Error('Not yet implemented');
      break;
    default:
      console.error('Invalid data source');
  }
}
