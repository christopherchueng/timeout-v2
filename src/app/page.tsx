"use client";

import { useTimeContext } from "@/context/Time";
import { weekdaysData } from "@/utils/constants";
import clsx from "clsx";
import Loading from "./_components/Clock/loading";

export default function Home() {
  const { parts } = useTimeContext();
  const { hour, minute, meridiem, day } = parts;

  return (
    <main className="flex min-h-screen w-full select-none flex-col items-center justify-center gap-6 text-7xl md:text-9xl">
      {!hour && <Loading size="lg" />}
      {hour && (
        <>
          <div className="flex justify-center gap-1">
            <span>{hour}</span>
            <span className="w-20 animate-blink text-center transition">:</span>
            <span>{minute}</span>&nbsp;
            <span className="self-end text-sm font-normal leading-[45px]">
              {meridiem}
            </span>
          </div>
          <div className="inline-flex justify-center gap-5 md:gap-10">
            {Object.values(weekdaysData).map(({ abbr }) => (
              <div
                key={abbr}
                className={clsx(
                  "text-xs uppercase",
                  abbr === day ? "text-slate-900" : "text-gray-200",
                )}
              >
                {abbr}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
