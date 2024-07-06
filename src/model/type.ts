import { Dayjs } from "dayjs";

export type Time = {
  start: Dayjs | null;
  end: Dayjs | null;
};

export type Type = "default" | "fullLeave" | "halfLeave";
