export type Event = {
  start: string;
  end: string;
  note: string;
};
type Day = {
  date: string;
  name: string;
  stages: string[][];
};
type Schedule = {
  days: Day[];
};

type Info = {
  name: string;
  region: string;
};

export type StageResponse = {
  events: Event[];
  info: Info;
  schedule: Schedule;
};

export type AreaResponse = {
  areas: Area[];
};

export type Area = {
  id: string;
  name: string;
  region: string;
};
