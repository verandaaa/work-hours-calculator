"use client";

import Day from "@/components/Day";
import { useEffect } from "react";
import useStore from "@/store/useStore";
import { Time } from "@/model/type";

const days = ["월", "화", "수", "목", "금"];

export default function Home() {
  const { times, getWorkTime, initTimes } = useStore();

  useEffect(() => {
    let times: Time[] = [];

    days.forEach((_, index) => {
      const storedTime = localStorage.getItem(`day-${index}`);
      if (storedTime) {
        times.push(JSON.parse(storedTime));
      } else {
        times.push({
          start: { hour: "", minute: "" },
          end: { hour: "", minute: "" },
        });
      }
    });

    initTimes(times);
  }, []);

  return (
    <main className="flex justify-center max-w-md w-full h-screen bg-slate-300">
      <div className="flex flex-col items-center gap-8 justify-center">
        <div className="">근무 시간 계산기</div>
        <div>
          {times.map((time, index) => (
            <Day label={days[index]} index={index} key={index} />
          ))}
        </div>
        <div>{getWorkTime()}</div>
      </div>
    </main>
  );
}
