// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import axios from "axios";
import { Response } from "./data.type";

interface Event {
  start: string;
  end: string;
  note: string;
}
const tokenKey = "eskom.token";
const areaKey = "eskom.area";

function scheduleLoadsheddingAlert(shedding: Event) {
  let start = new Date(shedding.start);
  let end = new Date(shedding.end);
  let alertTime = new Date(start);
  alertTime.setMinutes(alertTime.getMinutes() - 15);
  let currentTime = new Date();
  if (alertTime > currentTime) {
    return setTimeout(() => {
      vscode.window.showInformationMessage(
        `Loadshedding ${
          shedding.note
        } starts in 15 minutes\n${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`
      );
    }, alertTime.getTime() - currentTime.getTime());
  }
}
const callAPI = async (): Promise<Response | undefined> => {
  const config = vscode.workspace.getConfiguration();

  let token = config.get(tokenKey) as string | undefined;
  let area = config.get(areaKey) as string | undefined;
  if (!token) {
    await updateToken();
  }
  if (!area) {
    await updateArea();
  }

  const apiConfig = {
    headers: {
      token: token ?? "",
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

const updateData = async () => {
  const data = await callAPI();
  if (data?.events?.[0]) {
    scheduleLoadsheddingAlert(data.events[0]);
  }
};
const updateArea = async () => {
  const area = await vscode.window.showInputBox({
    placeHolder: "Enter your area id (e.g. capetown-7-greenpoint)",
  });
  await vscode.workspace
    .getConfiguration()
    .update(areaKey, area, vscode.ConfigurationTarget.Global);
};
const updateToken = async () => {
  const token = await vscode.window.showInputBox({
    placeHolder: "Enter your token",
  });
  await vscode.workspace
    .getConfiguration()
    .update(tokenKey, token, vscode.ConfigurationTarget.Global);
};

const nextSlot = async () => {
  const data = await callAPI();
  if (!data) {
    return console.error("No response from API");
  }
  const firstEvent = data.events[0];
  let end = new Date(firstEvent.end);
  let currentTime = new Date();
  let start = new Date(firstEvent.start);
  if (start < currentTime) {
    vscode.window.showInformationMessage(
      `Loadshedding ${firstEvent.note} ends at ${end.toLocaleTimeString()}`
    );
    return;
  }

  vscode.window.showInformationMessage(
    `Next Loadshedding ${
      firstEvent.note
    } starts at ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`
  );
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  updateData();

  let intervalId = setInterval(
    // Perform your task here
    updateData,
    3600000
  ); // repeat every 60 mins
  console.log({ intervalId });
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
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

// This method is called when your extension is deactivated
export function deactivate() {}

// create a function that calls the API every hour and updates the data
