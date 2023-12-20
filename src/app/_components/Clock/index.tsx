"use client";

import { useTimeContext } from "@/context/Time";
import clsx from "clsx";
import Loading from "./loading";

type ClockProps = {
  size: "sm" | "lg";
};
const Clock = ({ size = "lg" }: ClockProps) => {
  const { parts } = useTimeContext();
  const { hour, minute, meridiem } = parts;

  if (!parts.hour) return <Loading size={size} />;

  return (
    <div className="flex w-fit flex-row">
      <span>{hour}</span>
      <span
        className={clsx("animate-blink text-center transition-all", {
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
  );
};

export default Clock;
