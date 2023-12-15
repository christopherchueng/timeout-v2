import { RouterOutputs } from "@/trpc/shared";
import Alarm from "../Alarm";

type AlarmlistProps =
  RouterOutputs["alarmlist"]["getAlarmlistsByUserId"][number];

const Alarmlist = (alarmlist: AlarmlistProps) => {
  const { alarms } = alarmlist;
  return (
    <div className="px-4">
      <div className="flex justify-between rounded-xl border border-transparent px-2 py-0.5 text-lg transition duration-200 hover:bg-gray-200">
        <span className="self-center text-sm">{alarmlist.name}</span>
        <button>.</button>
      </div>
      {alarms.map((alarm) => (
        <Alarm {...alarm} key={alarm.id} />
      ))}
    </div>
  );
};

export default Alarmlist;
