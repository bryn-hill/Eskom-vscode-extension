export type Response = {
  events: {
    end: string;
    note: string;
    start: string;
  }[];
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
