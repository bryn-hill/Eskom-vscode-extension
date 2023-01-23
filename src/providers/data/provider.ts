// The Template Method Pattern Concept"

import * as vscode from 'vscode';
import { ApiResponse, Slot } from '../../data.type';
import { SETTINGS } from '../../settings.enum';
import { showError } from './utils';
import { format } from 'date-fns';
export abstract class AbstractProviderClass {
  protected context: vscode.ExtensionContext | undefined = undefined;

  constructor(context: vscode.ExtensionContext) {
    this.updateArea = this.updateArea.bind(this);
    this.nextSlot = this.nextSlot.bind(this);
    this.updateAlert = this.updateAlert.bind(this);
    this.context = context;
  }

  abstract callAPI(): Promise<ApiResponse | undefined>;
  abstract areaSearch(): Promise<string | undefined>;

  async updateArea() {
    const area = await this.areaSearch();

    if (!area) {
      showError('Area cannot be empty', this.updateArea);
    }
    await vscode.workspace
      .getConfiguration()
      .update(SETTINGS.areaKey, area, vscode.ConfigurationTarget.Global);
  }

  async nextSlot() {
    const data = await this.callAPI();

    if (!data) {
      return console.error('No response from API');
    }
    if (data.slots.length === 0) {
      return vscode.window.showInformationMessage('No load shedding');
    }
    const firstSlot = data.slots[0];

    let end = new Date(firstSlot.end);
    let currentTime = new Date();
    let start = new Date(firstSlot.start);

    if (start < currentTime) {
      vscode.window.showInformationMessage(
        `loadShedding ${firstSlot.stage} ends at ${end.toLocaleTimeString()}`
      );
      return;
    }

    // This function is used to get the current date and time
    // and then use it to get the next loadShedding schedule
    // from the loadShedding API and display it in the console

    vscode.window.showInformationMessage(
      `Next load shedding ${firstSlot.stage} starts at ${format(
        start,
        'HH:mm'
      )} - ${format(end, 'HH:mm')}`
    );
  }

  scheduleLoadSheddingAlert(shedding: Slot) {
    let start = new Date(shedding.start);
    let end = new Date(shedding.end);
    let currentTime = new Date();
    let alertTime = new Date(start);
    const config = vscode.workspace.getConfiguration();
    let warningTime = (config.get(SETTINGS.warningTime) as number) ?? 15;
    alertTime.setMinutes(alertTime.getMinutes() - warningTime);

    if (alertTime > currentTime) {
      const duration = alertTime.getTime() - currentTime.getTime();

      return setTimeout(() => {
        vscode.window.showInformationMessage(
          `load shedding ${
            shedding.stage
          } starts in ${warningTime} minutes\n${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`
        );
      }, duration);
    }
  }

  async updateAlert() {
    const data = await this.callAPI();
    if (!data) {
      return console.error('No response from API');
    }
    if (!data.slots || data.slots.length === 0) {
      return vscode.window.showInformationMessage(
        'Great news! 😃 No load shedding scheduled for your area today!'
      );
    }
    if (data.slots[0]) {
      return this.scheduleLoadSheddingAlert(data.slots[0]);
    }
  }
}
