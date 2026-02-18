import { create } from "zustand";
import { Time, WorkType } from "@/domains/1/types/type";
import { getIsDayOff } from "@/domains/1/utils/util";

type StoreState = {
  workTimes: Time[];
  workTypes: WorkType[];
  setWorkTimes: (newTimes: Time[]) => void;
  getNewWorkTimes: (index: number, newTime: Time) => Time[];
  setWorkTypes: (index: number, newWorkType: WorkType) => void;
  getWorkTime: () => string;
  initWorkTimes: (workTimes: Time[]) => void;
  initWorkTypes: (workTypes: WorkType[]) => void;
  getPlusMinus: (index: number) => number;
  getTotalPlusMinus: () => number;
  getTargetTime: () => number;
};

//workTime : 목표 근무 시간, freeTime : 근무 인정 시간, breakTime : 고정 휴게 시간
const workTypeInfos = {
  default: { workTime: 480, freeTime: 0, breakTime: 0 },
  fullLeave: { workTime: 480, freeTime: 480, breakTime: 0 },
  halfLeave: { workTime: 480, freeTime: 240, breakTime: 0 },
  quarterLeave: { workTime: 480, freeTime: 120, breakTime: 0 },
  freeDinner: { workTime: 600, freeTime: 0, breakTime: 30 },
  refreshDay: { workTime: 480, freeTime: 240, breakTime: 0 },
  holiday: { workTime: 480, freeTime: 480, breakTime: 0 },
};

const useStore = create<StoreState>((set, get) => {
  const getDiff = (index: number) => {
    const workTime = get().workTimes[index];
    const workType = get().workTypes[index];

    if (getIsDayOff(workType)) {
      return {
        total: workTypeInfos[workType].freeTime,
        work: workTypeInfos[workType].freeTime,
        rest: 0,
      };
    }
    if (workTime.start === null || workTime.end === null) {
      return { total: 0, work: 0, rest: 0 };
    }

    const startHour = workTime.start.hour();
    const startMinute = workTime.start.minute();
    const endHour = workTime.end.hour();
    const endMinute = workTime.end.minute();

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    const total =
      endTimeInMinutes - startTimeInMinutes + workTypeInfos[workType].freeTime;

    const lunchStartTimeInMinutes = 12 * 60 + 0;
    const lunchEndTimeInMinutes = 13 * 60 + 0;

    let breakTime = workTypeInfos[workType].breakTime;
    if (
      endTimeInMinutes <= lunchStartTimeInMinutes ||
      startTimeInMinutes >= lunchEndTimeInMinutes
    ) {
      //
    } else {
      const overlapStart = Math.max(
        startTimeInMinutes,
        lunchStartTimeInMinutes
      );
      const overlapEnd = Math.min(endTimeInMinutes, lunchEndTimeInMinutes);
      breakTime += overlapEnd - overlapStart;
    }
    const work = total - breakTime;

    return { total: total, work: work, rest: breakTime };
  };

  return {
    workTimes: [],
    workTypes: [],
    setWorkTimes: (newTimes) => set({ workTimes: newTimes }),
    getNewWorkTimes: (index, newTime) => {
      return get().workTimes.map((time, i) => (i === index ? newTime : time));
    },
    setWorkTypes: (index, newType) =>
      set((state) => ({
        workTypes: state.workTypes.map((workType, i) =>
          i === index ? newType : workType
        ),
      })),
    getPlusMinus: (index: number) => {
      const { work } = getDiff(index);
      const workType = get().workTypes[index];
      if (getIsDayOff(workType)) {
        return 0;
      }
      if (work === 0) {
        return 0;
      }
      const todayTotalTime = work - workTypeInfos[workType].workTime;

      return todayTotalTime;
    },
    getTotalPlusMinus: () => {
      const totalPlusMinus = get().workTimes.reduce((total, _, index) => {
        return total + get().getPlusMinus(index);
      }, 0);

      return totalPlusMinus;
    },
    getWorkTime: () => {
      let totalTime = 0;
      let workTime = 0;
      let breakTime = 0;

      get().workTimes.forEach((time, index) => {
        const { total, work, rest } = getDiff(index);
        totalTime += total;
        workTime += work;
        breakTime += rest;
      });

      const totalTimeFormatted = `${Math.floor(totalTime / 60)}시간 ${
        totalTime % 60
      }분`;
      const restTimeFormatted = `${Math.floor(breakTime / 60)}시간 ${
        breakTime % 60
      }분`;
      const workTimeFormatted = `${Math.floor(workTime / 60)}시간 ${
        workTime % 60
      }분`;
      const result = `${totalTimeFormatted} - ${restTimeFormatted} = ${workTimeFormatted}`;

      return result;
    },
    getTargetTime: () => {
      const workTypes = get().workTypes;

      const targetTime = workTypes.reduce((acc, workType) => {
        return acc + workTypeInfos[workType].workTime;
      }, 0);

      return targetTime / 60;
    },
    initWorkTimes: (workTimes: Time[]) => set({ workTimes }),
    initWorkTypes: (workTypes: WorkType[]) => set({ workTypes }),
  };
});

export default useStore;
