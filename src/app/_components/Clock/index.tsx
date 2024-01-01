"use client";

import { useTimeContext } from "@/context/Time";
import clsx from "clsx";
import Loading from "./loading";

type ClockProps = {
  size: "sm" | "lg";
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const Clock = ({ size = "lg" }: ClockProps) => {
  const { parts } = useTimeContext();
  const { hour, minute, meridiem, day } = parts;

  // console.log("what is day", day);

  if (!parts.hour) return <Loading size={size} />;

  return (
    <div className="flex w-full flex-col justify-center gap-6">
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
      <div className="inline-flex justify-center gap-5 transition md:gap-10">
        {DAYS.map((DAY) => (
          <div
            key={DAY}
            className={clsx(
              "text-xs uppercase",
              DAY === day ? "text-slate-900" : "text-gray-200",
            )}
          >
            {DAY}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clock;
