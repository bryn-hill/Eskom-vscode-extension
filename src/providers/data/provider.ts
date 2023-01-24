/**
 * The AbstractProviderClass is an abstract class that serves as a template for classes that provide functionality to interact with a load shedding API.
 * It defines a `callAPI` and an `areaSearch` method which are both abstract, meaning that they have no implementation and must be implemented by any concrete class that extends this class.
 * The class also defines three methods: `updateArea`, `nextSlot`, `updateAlert` and `scheduleLoadSheddingAlert` that use the above abstract methods to interact with the API and the vscode extension.
 *
 * @abstract
 * @class AbstractProviderClass
 *
 * @abstract
 * @function callAPI - This method must be implemented by any concrete class that extends this class. It is responsible for calling the load shedding API and returning the response as a standardised @type ApiResponse object.
 * @returns {Promise<ApiResponse | undefined>} A promise that resolves to an ApiResponse or undefined if there was an error
 *
 * @abstract
 * @function areaSearch - This method must be implemented by any concrete class that extends this class. It is responsible for searching for the area string that will be used to call the load shedding API.
 * @returns {Promise<string | undefined>} A promise that resolves to an area string or undefined if there was an error
 */

import * as vscode from 'vscode';
import { ApiResponse, Slot } from '../../data.type';
import { SETTINGS } from '../../settings.enum';
import { showError } from './utils';
import { format } from 'date-fns';
export abstract class AbstractProviderClass {
  protected context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  abstract callAPI(): Promise<ApiResponse | undefined>;
  abstract areaSearch(): Promise<string | undefined>;

  updateArea = async () => {
    const area = await this.areaSearch();

    if (!area) {
      showError('Area cannot be empty', this.updateArea);
    }
    await vscode.workspace
      .getConfiguration()
      .update(SETTINGS.areaKey, area, vscode.ConfigurationTarget.Global);
  };

  nextSlot = async () => {
    const data = await this.callAPI();

    if (!data) {
      return vscode.window.showErrorMessage('No response received from API');
    }
    if (data.slots.length === 0) {
      return vscode.window.showInformationMessage('No load shedding');
    }
    const firstSlot = data.slots[0];

    let end = new Date(firstSlot.end);
    let currentTime = new Date();
    let start = new Date(firstSlot.start);

    if (start < currentTime) {
      //Load shedding has started
      vscode.window.showInformationMessage(
        `Current load shedding ${firstSlot.stage} ends at ${format(
          end,
          'HH:mm'
        )}`
      );
      return;
    }

    //Load shedding has not started yet
    vscode.window.showInformationMessage(
      `Next load shedding ${firstSlot.stage} starts at ${format(
        start,
        'HH:mm'
      )} - ${format(end, 'HH:mm')}`
    );
  };

  scheduleLoadSheddingAlert = (shedding: Slot) => {
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
          } starts in ${warningTime} minutes ${format(
            start,
            'HH:mm'
          )} - ${format(end, 'HH:mm')}`
        );
      }, duration);
    }
    // Load shedding has already started so show the warning message
    this.nextSlot();
  };

  updateAlert = async () => {
    const data = await this.callAPI();

    if (!data) {
      return vscode.window.showErrorMessage('No response from API');
    }

    // If there are no slots, then there is no load shedding
    if (data.slots === undefined || data.slots.length === 0) {
      return vscode.window.showInformationMessage(
        'Great news! 😃 No load shedding scheduled for your area today!'
      );
    }

    if (data.slots[0]) {
      return this.scheduleLoadSheddingAlert(data.slots[0]);
    }
  };
}
