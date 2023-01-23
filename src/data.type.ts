export type Slot = {
  start: string;
  end: string;
  stage: string;
};

export type ApiResponse = {
  slots: Slot[];
};

export type CachedResponse = {
  apiResponse: ApiResponse;
  area: string;
  timestamp: Date;
};
