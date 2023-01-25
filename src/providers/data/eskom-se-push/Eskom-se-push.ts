import { differenceInHours, parseISO } from 'date-fns';
import * as vscode from 'vscode';
import { ApiResponse, CachedResponse } from '../../../data.type';
import { Cache, SETTINGS } from '../../../settings.enum';
import { AbstractProviderClass } from '../provider';
import { showError } from '../utils';
import { areaSearch } from './area-search';
import { callEskomSePushAPI } from './call-api';

export class EskomSePushProvider extends AbstractProviderClass {
  constructor(context: vscode.ExtensionContext) {
    super(context);

    const updateTokenCommand = vscode.commands.registerCommand(
      'eskom.updateToken',
      this.updateToken
    );

    const invalidateCacheCommand = vscode.commands.registerCommand(
      'eskom.invalidateCache',
      this.invalidateCache
    );

    this.context?.subscriptions.push(
      updateTokenCommand,
      invalidateCacheCommand
    );
  }

  invalidateCache = () => {
    this.context?.globalState.update(Cache.schedule, undefined);
  };

  cacheResponseCall = async (token: string, area: string) => {
    let cachedData = this.context?.globalState.get<CachedResponse>(
      Cache.schedule
    );

    if (
      !cachedData ||
      area !== cachedData.area ||
      differenceInHours(
        parseISO(new Date(cachedData.timestamp).toISOString()),
        new Date()
      ) !== 0
    ) {
      const data = await callEskomSePushAPI(token, area);
      if (!data) {
        return;
      }
      cachedData = {
        apiResponse: data,
        timestamp: new Date(),
        area
      };
      this.context?.globalState.update(Cache.schedule, cachedData);
      return data;
    }
    return cachedData.apiResponse;
  };

  areaSearch = async (): Promise<string | undefined> => {
    const config = vscode.workspace.getConfiguration();
    const token = config.get(SETTINGS.tokenKey) as string | undefined;
    if (!token) {
      await this.updateToken();
    }
    if (!token) {
      return;
    }

    return areaSearch(token);
  };

  callAPI = async (): Promise<ApiResponse | undefined> => {
    const config = vscode.workspace.getConfiguration();
    let token = config.get(SETTINGS.tokenKey) as string | undefined;
    let area = config.get(SETTINGS.areaKey) as string | undefined;
    if (!token) {
      await this.updateToken();
    }
    if (!area) {
      await this.updateArea();
    }
    if (!token || !area) {
      console.error(token ? 'Area is empty' : 'Token is empty');
      return;
    }

    return this.cacheResponseCall(token, area);
  };

  updateToken = async () => {
    const token = await vscode.window.showInputBox({
      placeHolder: 'Enter your token'
    });

    if (!token) {
      showError('API Token cannot be empty', this.updateToken);
      return;
    }

    await vscode.workspace
      .getConfiguration()
      .update(SETTINGS.tokenKey, token, vscode.ConfigurationTarget.Global);
  };
}
