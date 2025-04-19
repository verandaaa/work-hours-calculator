import { create } from "zustand";
import { Time, Type } from "@/model/type";

type StoreState = {
  times: Time[];
  types: Type[];
  setTimes: (index: number, newTime: Time) => void;
  setTypes: (index: number, type: Type) => void;
  getWorkTime: () => string;
  initTimes: (times: Time[]) => void;
  initTypes: (types: Type[]) => void;
  getPlusMinus: (index: number) => number;
  getTotalPlusMinus: () => number;
  getTargetTime: () => number;
};

//workTime : 목표 근무 시간, freeTime : 근무 인정 시간, restTime : 고정 휴게 시간
const typeInfos = {
  default: { workTime: 480, freeTime: 0, restTime: 0 },
  fullLeave: { workTime: 480, freeTime: 480, restTime: 0 },
  halfLeave: { workTime: 480, freeTime: 240, restTime: 0 },
  quarterLeave: { workTime: 480, freeTime: 120, restTime: 0 },
  freeDinner: { workTime: 600, freeTime: 0, restTime: 30 },
  refreshDay: { workTime: 480, freeTime: 240, restTime: 0 },
};

const useStore = create<StoreState>((set, get) => {
  const getDiff = (index: number) => {
    const time = get().times[index];
    const type = get().types[index];

    if (type === "fullLeave") {
      return {
        total: typeInfos[type].freeTime,
        work: typeInfos[type].freeTime,
        rest: 0,
      };
    }
    if (time.start === null || time.end === null) {
      return { total: 0, work: 0, rest: 0 };
    }

    const startHour = time.start.hour();
    const startMinute = time.start.minute();
    const endHour = time.end.hour();
    const endMinute = time.end.minute();

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    const total =
      endTimeInMinutes - startTimeInMinutes + typeInfos[type].freeTime;

    const lunchStartTimeInMinutes = 12 * 60 + 0;
    const lunchEndTimeInMinutes = 13 * 60 + 0;

    let restTime = typeInfos[type].restTime;
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
      restTime += overlapEnd - overlapStart;
    }
    const work = total - restTime;

    return { total: total, work: work, rest: restTime };
  };

  return {
    times: [],
    types: [],
    setTimes: (index, newTime) =>
      set((state) => ({
        times: state.times.map((time, i) => (i === index ? newTime : time)),
      })),
    setTypes: (index, newType) =>
      set((state) => ({
        types: state.types.map((type, i) => (i === index ? newType : type)),
      })),
    getPlusMinus: (index: number) => {
      const { work } = getDiff(index);
      const type = get().types[index];
      if (type === "fullLeave") {
        return 0;
      }
      if (work === 0) {
        return 0;
      }
      const todayTotalTime = work - typeInfos[type].workTime;

      return todayTotalTime;
    },
    getTotalPlusMinus: () => {
      const totalPlusMinus = get().times.reduce((total, _, index) => {
        return total + get().getPlusMinus(index);
      }, 0);

      return totalPlusMinus;
    },
    getWorkTime: () => {
      let totalTime = 0;
      let workTime = 0;
      let restTime = 0;

      get().times.forEach((time, index) => {
        const { total, work, rest } = getDiff(index);
        totalTime += total;
        workTime += work;
        restTime += rest;
      });

      const totalTimeFormatted = `${Math.floor(totalTime / 60)}시간 ${
        totalTime % 60
      }분`;
      const restTimeFormatted = `${Math.floor(restTime / 60)}시간 ${
        restTime % 60
      }분`;
      const workTimeFormatted = `${Math.floor(workTime / 60)}시간 ${
        workTime % 60
      }분`;
      const result = `${totalTimeFormatted} - ${restTimeFormatted} = ${workTimeFormatted}`;

      return result;
    },
    getTargetTime: () => {
      const types = get().types;

      const targetTime = types.reduce((acc, type) => {
        return acc + typeInfos[type].workTime;
      }, 0);

      return targetTime / 60;
    },
    initTimes: (times: Time[]) => set({ times: times }),
    initTypes: (types: Type[]) => set({ types: types }),
  };
});

export default useStore;
