import { WORK_TYPE } from "@/domains/1/constants/constant";
import { WorkType } from "@/domains/1/types/type";

export function getIsDayOff(workType: WorkType) {
  if (workType === WORK_TYPE.FULL_LEAVE || workType === WORK_TYPE.HOLIDAY) {
    return true;
  }
  return false;
}
