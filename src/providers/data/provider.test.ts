import { addHours, addMinutes, format } from 'date-fns';

import * as vscode from 'vscode';
import { ApiResponse, Slot } from '../../data.type';
import { AbstractProviderClass } from './provider';
const mockAreaSearch = jest.fn();
const mockCallAPI = jest.fn();
class TestProvider extends AbstractProviderClass {
  areaSearch(): Promise<string | undefined> {
    return mockAreaSearch();
  }
  callAPI(): Promise<ApiResponse | undefined> {
    return mockCallAPI();
  }
}

jest.mock('eskom-loadshedding-api');
let context: any;

describe('Provider test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    context = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn()
      }
    };
  });
  test('it schedules an alert for the start of load shedding', () => {
    const provider = new TestProvider(context);
    jest.useFakeTimers();
    vscode.workspace.getConfiguration = jest
      .fn()
      .mockReturnValue({ get: jest.fn().mockReturnValue(15) });

    const start = addMinutes(new Date(), 16);
    const end = addHours(new Date(), 2);
    const mockShedding = {
      start: start.toISOString(),
      end: end.toISOString(),
      stage: '1'
    } as Slot;

    provider.scheduleLoadSheddingAlert(mockShedding);
    expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000 * 60 * 1);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      `load shedding 1 starts in 15 minutes ${format(
        start,
        'HH:mm'
      )} - ${format(end, 'HH:mm')}`
    );
  });

  test('it does not schedule an alert if load shedding has already started', () => {
    const provider = new TestProvider(context);
    const shedding = {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      stage: '1'
    } as Slot;
    const config = { get: jest.fn().mockReturnValue(15) };
    const vscode = {
      window: { showInformationMessage: jest.fn() },
      workspace: { getConfiguration: jest.fn().mockReturnValue(config) }
    };
    const nextSlot = jest.spyOn(provider, 'nextSlot');

    provider.scheduleLoadSheddingAlert(shedding);
    expect(nextSlot).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
  });
});
