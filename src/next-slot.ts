import * as vscode from "vscode";
import { callAPI } from "./api-service";

export const nextSlot = async () => {
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
