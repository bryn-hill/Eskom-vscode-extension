import axios from "axios";
import * as vscode from "vscode";
import { Response } from "./data.type";
import { SETTINGS } from "./settings.enum";
import { updateArea, updateToken } from "./update-settings";

export const callAPI = async (): Promise<Response | undefined> => {
  const config = vscode.workspace.getConfiguration();

  let token = config.get(SETTINGS.tokenKey) as string | undefined;
  let area = config.get(SETTINGS.areaKey) as string | undefined;

  if (!token) {
    await updateToken();
  }
  if (!area) {
    await updateArea();
  }
  if (!token || !area) {
    return;
  }
  const apiConfig = {
    headers: {
      token,
    },
  };
  try {
    const response = await axios.get(
      `https://developer.sepush.co.za/business/2.0/area?id=${area}`,
      apiConfig
    );
    const data = response.data;

    return data;
  } catch (error) {
    console.error(error);
  }
};
