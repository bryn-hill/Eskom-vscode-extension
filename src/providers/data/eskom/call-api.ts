import { isBefore, isToday } from 'date-fns';
import { Schedule, SearchSuburb, Status } from 'eskom-loadShedding-api';
import * as vscode from 'vscode';
import { ApiResponse, Slot } from '../../../data.type';
import { SETTINGS } from '../../../settings.enum';

export const callEskomAPI = async (): Promise<ApiResponse | undefined> => {
  const stage = await Status.getStatus();

  const config = vscode.workspace.getConfiguration();
  let area = config.get(SETTINGS.areaKey) as string | undefined;
  const areaCode = JSON.parse(area ?? '{}') as SearchSuburb;

  const schedule = await Schedule.getSchedule(areaCode.id, 4);

  const currentTime = new Date();

  const filteredSchedule = schedule.schedule
    .filter(({ day }) => isToday(day))
    .map((day) => {
      day.times = day.times.filter((time) =>
        isBefore(currentTime, time.endTime)
      );
      return day;
    })
    .filter((day) => day.times.length);

  if (filteredSchedule) {
    const slots = filteredSchedule[0].times.map(
      (item) =>
        ({
          start: item.startTime.toString(),
          end: item.endTime.toString(),
          stage: stage.toString()
        } as Slot)
    );

    return {
      slots
    } as ApiResponse;
  }
  return undefined;
};
