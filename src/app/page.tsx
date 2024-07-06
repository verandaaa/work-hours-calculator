"use client";

import Day from "@/components/Day";
import { useEffect } from "react";
import useStore from "@/store/useStore";
import { Time, Type } from "@/model/type";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

const days = ["월", "화", "수", "목", "금"];
dayjs.extend(weekOfYear);

export default function Home() {
  const { times, getWorkTime, initTimes, getTargetTime, initTypes } = useStore();

  useEffect(() => {
    if (localStorage.getItem("lastAccessWeek")) {
      let lastAccessWeek = Number(localStorage.getItem("lastAccessWeek"));
      let currentWeek = dayjs().week();
      if (lastAccessWeek < currentWeek) {
        localStorage.clear();
      }
    } else {
      localStorage.clear();
    }
    localStorage.setItem("lastAccessWeek", JSON.stringify(dayjs().week()));

    let times: Time[] = [];
    days.forEach((_, index) => {
      const storedTime = localStorage.getItem(`day-${index}`);
      if (storedTime) {
        const start = JSON.parse(storedTime).start ? dayjs(JSON.parse(storedTime).start) : null;
        const end = JSON.parse(storedTime).end ? dayjs(JSON.parse(storedTime).end) : null;

        times.push({
          start: start,
          end: end,
        });
      } else {
        times.push({
          start: null,
          end: null,
        });
      }
    });

    let types: Type[] = ["default", "default", "default", "default", "default"];
    const storedTypes = localStorage.getItem("types");
    if (storedTypes) {
      types = Object.values(JSON.parse(storedTypes));
    }

    initTimes(times);
    initTypes(types);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <main className="flex justify-center max-w-md w-full h-screen bg-white">
        <div className="flex flex-col items-center gap-8 justify-center">
          <div className="text-2xl">근무 시간 계산기</div>
          <div>
            {times.map((time, index) => (
              <Day label={days[index]} index={index} key={index} />
            ))}
          </div>
          <div>{getWorkTime()}</div>
          <div>이번 주 목표 : {getTargetTime()}시간</div>
        </div>
      </main>
    </LocalizationProvider>
  );
}
