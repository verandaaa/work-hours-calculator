"use client";

import Work from "@/domains/1/components/work";
import { useEffect } from "react";
import useStore from "@/domains/1/stores/use-store";
import { Time, WorkType } from "@/domains/1/types/type";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  DAY_LIST,
  LOCAL_STORAGE_KEY,
  WORK_TYPE,
} from "@/domains/1/constants/constant";

export default function Page() {
  const {
    workTimes,
    getWorkTime,
    initWorkTimes,
    getTargetTime,
    initWorkTypes,
    getTotalPlusMinus,
  } = useStore();
  const totalPlusMinus = getTotalPlusMinus();

  const resetLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY.LAST_ACCESS_WEEK);
    localStorage.removeItem(LOCAL_STORAGE_KEY.WORK_TYPES);
    localStorage.removeItem(LOCAL_STORAGE_KEY.WORK_TIMES);
  };

  useEffect(() => {
    //주 1회 초기화
    let storedLastAccessWeek = localStorage.getItem(
      LOCAL_STORAGE_KEY.LAST_ACCESS_WEEK
    );
    if (storedLastAccessWeek) {
      let lastAccessWeek = Number(storedLastAccessWeek);
      let currentWeek = dayjs().week();
      if (
        lastAccessWeek < currentWeek ||
        (currentWeek === 0 && lastAccessWeek !== 0)
      ) {
        resetLocalStorage();
      }
    } else {
      resetLocalStorage();
    }
    localStorage.setItem(
      LOCAL_STORAGE_KEY.LAST_ACCESS_WEEK,
      JSON.stringify(dayjs().week())
    );

    //근로시간
    let workTimes: Time[] = [];
    let localStorageWorkTimes = localStorage.getItem(
      LOCAL_STORAGE_KEY.WORK_TIMES
    );
    let newWorkTimes: Time[] | null = null;
    if (localStorageWorkTimes) {
      newWorkTimes = JSON.parse(localStorageWorkTimes);
    }
    if (newWorkTimes) {
      workTimes = [...newWorkTimes].map((newWorkTime) => {
        const start = newWorkTime.start ? dayjs(newWorkTime.start) : null;
        const end = newWorkTime.end ? dayjs(newWorkTime.end) : null;
        return { start, end };
      });
    } else {
      workTimes = Array(DAY_LIST.length)
        .fill(null)
        .map(() => ({
          start: null,
          end: null,
        }));
    }

    //근무타입
    let workTypes: WorkType[] = Array(DAY_LIST.length).fill(WORK_TYPE.DEFAULT);
    const storedTypes = localStorage.getItem(LOCAL_STORAGE_KEY.WORK_TYPES);
    if (storedTypes) {
      workTypes = Object.values(JSON.parse(storedTypes));
    }

    initWorkTimes(workTimes);
    initWorkTypes(workTypes);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <main className="flex justify-center max-w-md w-full h-screen">
        <div className="flex flex-col items-center gap-8 justify-center">
          <div className="text-2xl">근무 시간 계산기</div>
          <div className="min-h-[296px]">
            {workTimes.map((time, index) => (
              <Work label={DAY_LIST[index]} index={index} key={index} />
            ))}
          </div>
          <div>
            {totalPlusMinus > 0 ? "+" : ""}
            {totalPlusMinus}분
          </div>
          <div>{getWorkTime()}</div>
          <div>이번 주 목표 : {getTargetTime()}시간</div>
        </div>
      </main>
    </LocalizationProvider>
  );
}
