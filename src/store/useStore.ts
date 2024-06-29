import { create } from "zustand";
import { Time } from "@/model/type";

type StoreState = {
  times: Time[];
  types: "default"[];
  setTimes: (index: number, newTime: Time) => void;
  getWorkTime: () => string;
  initTimes: (times: Time[]) => void;
  getPlusMinus: (index: number) => number;
};

const typeInfos = { default: { restTime: 60, workTime: 480 } };

const useStore = create<StoreState>((set, get) => {
  const getDiff = (index: number) => {
    if (
      get().times[index].start.hour === "" ||
      get().times[index].start.minute === "" ||
      get().times[index].end.hour === "" ||
      get().times[index].end.minute === ""
    ) {
      return 0;
    }

    const startHour = parseInt(get().times[index].start.hour);
    const startMinute = parseInt(get().times[index].start.minute);
    const endHour = parseInt(get().times[index].end.hour);
    const endMinute = parseInt(get().times[index].end.minute);

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    const diff = endTimeInMinutes - startTimeInMinutes;

    return diff;
  };

  return {
    times: [],
    types: ["default", "default", "default", "default", "default"],
    setTimes: (index, newTime) =>
      set((state) => ({
        times: state.times.map((time, i) => (i === index ? newTime : time)),
      })),
    getPlusMinus: (index: number) => {
      const diff = getDiff(index);
      if (diff === 0) {
        return 0;
      }
      const todayTotalTime = diff - typeInfos[get().types[index]].workTime - typeInfos[get().types[index]].restTime;

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
    initTimes: (times: Time[]) => set({ times: times }),
  };
});

export default useStore;
