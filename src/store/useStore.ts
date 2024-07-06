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
  getTargetTime: () => number;
};

const typeInfos = {
  default: { restTime: 60, workTime: 480 },
  fullLeave: { restTime: 0, leaveHour: 8 },
  halfLeave: { restTime: 30, workTime: 240, leaveHour: 4 },
};

const useStore = create<StoreState>((set, get) => {
  const getDiff = (index: number) => {
    const time = get().times[index];

    if (time.start === null || time.end === null) {
      return 0;
    }

    const startHour = time.start.hour();
    const startMinute = time.start.minute();
    const endHour = time.end.hour();
    const endMinute = time.end.minute();

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    const diff = endTimeInMinutes - startTimeInMinutes;

    return diff;
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
      const diff = getDiff(index);
      const type = get().types[index];
      if (diff === 0 || type === "fullLeave") {
        return 0;
      }
      const todayTotalTime = diff - typeInfos[type].workTime - typeInfos[type].restTime;

      return todayTotalTime;
    },
    getWorkTime: () => {
      const totalTime = get().times.reduce((total, _, index) => {
        total += getDiff(index);

        return total;
      }, 0);

      const restTime = get().times.reduce((total, _, index) => {
        const diff = getDiff(index);
        if (diff === 0) {
          return total;
        }
        total += typeInfos[get().types[index]]["restTime"];
        return total;
      }, 0);

      const workTime = totalTime - restTime;

      const totalTimeFormatted = `${Math.floor(totalTime / 60)}시간 ${totalTime % 60}분`;
      const restTimeFormatted = `${Math.floor(restTime / 60)}시간 ${restTime % 60}분`;
      const workTimeFormatted = `${Math.floor(workTime / 60)}시간 ${workTime % 60}분`;
      const result = `${totalTimeFormatted} - ${restTimeFormatted} = ${workTimeFormatted}`;

      return result;
    },
    getTargetTime: () => {
      const initialTargetTime = 40;
      const types = get().types;

      const targetTime = types.reduce((acc, type) => {
        if (type === "fullLeave" || type === "halfLeave") {
          return acc - typeInfos[type].leaveHour;
        }
        return acc;
      }, initialTargetTime);

      return targetTime;
    },
    initTimes: (times: Time[]) => set({ times: times }),
    initTypes: (types: Type[]) => set({ types: types }),
  };
});

export default useStore;
