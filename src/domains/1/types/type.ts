import { WORK_TIME, WORK_TYPE } from "@/domains/1/constants/constant";
import { Dayjs } from "dayjs";

export type Time = {
  start: Dayjs | null;
  end: Dayjs | null;
};

export type WorkType = (typeof WORK_TYPE)[keyof typeof WORK_TYPE];

export type WorkTime = (typeof WORK_TIME)[keyof typeof WORK_TIME];
