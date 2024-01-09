"use client";

import { useTimeContext } from "@/context/Time";
import clsx from "clsx";
import Loading from "./loading";
import { weekdaysData } from "@/utils/constants";

type ClockProps = {
  size: "sm" | "lg";
};

const Clock = ({ size = "lg" }: ClockProps) => {
  const { parts } = useTimeContext();
  const { hour, minute, meridiem, day } = parts;

  if (!parts.hour) return <Loading size={size} />;

  return (
    <div className="flex w-full select-none flex-col justify-center gap-6">
      <div className="flex justify-center gap-1">
        <span>{hour}</span>
        <span
          className={clsx("animate-blink text-center transition", {
            "w-2": size === "sm",
            "w-20": size === "lg",
          })}
        >
          :
        </span>
        <span>{minute}</span>&nbsp;
        <span
          className={clsx("self-end font-normal", {
            "text-2xs leading-5": size === "sm",
            "text-sm leading-[45px]": size === "lg",
          })}
        >
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
    </div>
  );
};

export default Clock;
