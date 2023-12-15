import { RouterOutputs } from "@/trpc/shared";
import clsx from "clsx";

type AlarmProps = RouterOutputs["alarm"]["getAlarmsByAlarmlistId"][number];

const Alarm = (alarm: AlarmProps) => {
  return (
    <div className="flex flex-row justify-between rounded-xl border border-transparent px-2 py-0.5 transition duration-200 hover:bg-gray-200">
      <div
        className={clsx("flex flex-col transition", {
          "text-gray-400": !alarm.isOn,
        })}
      >
        <div className="flex items-end gap-0.5 py-0.5 font-bold">
          <span className="text-sm leading-tight transition">
            {alarm.hour}:{alarm.minutes}
          </span>
          <span className="text-2xs">{alarm.meridiem}</span>
        </div>
        <div className="text-xs">{alarm.name}</div>
      </div>
      <button>.</button>
    </div>
  );
};

export default Alarm;
