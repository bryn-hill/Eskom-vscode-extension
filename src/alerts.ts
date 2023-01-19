import * as vscode from "vscode";
import { callAPI } from "./api-service";
import { Event } from "./data.type";

function scheduleLoadsheddingAlert(shedding: Event) {
  let start = new Date(shedding.start);
  let end = new Date(shedding.end);
  let currentTime = new Date();
  let alertTime = new Date(start);

  alertTime.setMinutes(alertTime.getMinutes() - 15);

  if (alertTime > currentTime) {
    const duration = alertTime.getTime() - currentTime.getTime();

    return setTimeout(() => {
      vscode.window.showInformationMessage(
        `Loadshedding ${
          shedding.note
        } starts in 15 minutes\n${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`
      );
    }, duration);
  }
}

export const updateAlert = async () => {
  const data = await callAPI();
  if (data?.events?.[0]) {
    scheduleLoadsheddingAlert(data.events[0]);
  }
};
