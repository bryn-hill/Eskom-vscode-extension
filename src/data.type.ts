export type Event = {
  start: string;
  end: string;
  note: string;
};

export type Response = {
  events: Event[];
  info: {
    name: string;
    region: string;
  };
  schedule: {
    days: {
      date: string;
      name: string;
      stages: string[][];
    }[];
    source: string;
  };
};
