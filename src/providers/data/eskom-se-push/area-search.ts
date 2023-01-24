import axios from 'axios';
import * as vscode from 'vscode';
import { AreaResponse } from './response.type';

export const areaSearch = async (token: string) => {
  const apiConfig = {
    headers: {
      token
    }
  };
  const area = await vscode.window.showInputBox({
    placeHolder: 'Enter Area Eg. Green Point'
  });
  if (!area) {
    return;
  }
  const api = `https://developer.sepush.co.za/business/2.0/areas_search?text=${encodeURI(
    area
  )}&test=current`;
  try {
    const response = await axios.get(api, apiConfig);
    const data = response.data as AreaResponse;
    if (!data) {
      return vscode.window.showErrorMessage(
        'Could not connect to EskomSePush API'
      );
    }
    const selectedItem = await vscode.window.showQuickPick(
      data.areas
        .sort((a, b) => {
          if (a.region < b.region) {
            return -1;
          }
          if (a.region > b.region) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        })
        .map((item) => ({
          label: `${item.region} - ${item.name}`,
          details: item.id
        }))
    );
    return selectedItem?.details;
  } catch (error) {
    console.error(error);
  }
};
