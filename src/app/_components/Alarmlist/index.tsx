"use client";

import { RouterOutputs } from "@/trpc/shared";
import Alarm from "../Alarm";
import Switch from "../UI/Switch";

type AlarmlistProps =
  RouterOutputs["alarmlist"]["getAlarmlistsByUserId"][number];

const Alarmlist = (alarmlist: AlarmlistProps) => {
  const { alarms } = alarmlist;
  return (
    <div className="px-4">
      <div className="flex justify-between rounded-xl border border-transparent px-2 py-0.5 text-lg transition duration-200 hover:bg-gray-200">
        <span className="self-center font-bold">{alarmlist.name}</span>
        <Switch
          checked={!alarmlist.isOn}
          onChange={() => console.log("Toggle Alarmlist")}
        />
      </div>
      {alarms.map((alarm) => (
        <Alarm {...alarm} key={alarm.id} />
      ))}
    </div>
  );
};

export default Alarmlist;
