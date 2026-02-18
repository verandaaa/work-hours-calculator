export const WORK_TYPE = {
  DEFAULT: "default",
  FULL_LEAVE: "fullLeave",
  HALF_LEAVE: "halfLeave",
  QUARTER_LEAVE: "quarterLeave",
  FREE_DINNER: "freeDinner",
  REFRESH_DAY: "refreshDay",
  HOLIDAY: "holiday",
} as const;

export const WORK_TIME = {
  START: "start",
  END: "end",
} as const;

export const DAY = {
  MON: "월",
  TUE: "화",
  WED: "수",
  THU: "목",
  FRI: "금",
} as const;

export const DAY_LIST = [DAY.MON, DAY.TUE, DAY.WED, DAY.THU, DAY.FRI] as const;

const PREFIX = "1_";

export const LOCAL_STORAGE_KEY = {
  LAST_ACCESS_WEEK: `${PREFIX}lastAccessWeek`,
  WORK_TYPES: `${PREFIX}workTypes`,
  WORK_TIMES: `${PREFIX}workTimes`,
} as const;
