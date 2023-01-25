import * as eskom from './call-api';
import * as vscode from 'vscode';
import {
  Status,
  Schedule,
  LoadsheddingStage,
  LoadsheddingSchedule
} from 'eskom-loadshedding-api';
import { addHours } from 'date-fns';
jest.mock('eskom-loadshedding-api');

describe('test', () => {
  it('test', async () => {
    jest.useFakeTimers();
    (Status.getStatus as jest.Mock).mockReturnValue(LoadsheddingStage.STAGE_4);
    (Schedule.getSchedule as jest.Mock).mockReturnValue({
      schedule: [
        {
          day: new Date(),
          times: [{ startTime: new Date(), endTime: addHours(new Date(), 2) }]
        }
      ]
    } as LoadsheddingSchedule);
    jest.spyOn(vscode.workspace, 'getConfiguration').mockReturnValue({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn(),
      inspect: jest.fn()
    });
    await eskom.callEskomAPI();
    expect(vscode.workspace.getConfiguration).toHaveBeenCalled();
  });
});
