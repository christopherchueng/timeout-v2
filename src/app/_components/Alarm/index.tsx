"use client";

import { RouterOutputs } from "@/trpc/shared";
import clsx from "clsx";
import Switch from "../UI/Switch";

type AlarmProps = RouterOutputs["alarm"]["getAlarmsByAlarmlistId"][number];

const Alarm = (alarm: AlarmProps) => {
  return (
    <div className="flex flex-row justify-between rounded-xl border border-transparent px-2 py-0.5 transition duration-200 hover:bg-gray-200">
      <div
        className={clsx("flex flex-col transition", {
          "text-gray-400": !alarm.isOn,
        })}
      >
        <div className="flex items-end gap-0.5 font-bold">
          <span className="leading-tight transition">
            {alarm.hour}:{alarm.minutes}
          </span>
          <span className="text-2xs">{alarm.meridiem}</span>
        </div>
        <div className="text-xs">{alarm.name}</div>
      </div>
      <Switch
        checked={alarm.isOn}
        onChange={() => console.log("Toggle alarm")}
      />
    </div>
  );
};

export default Alarm;
