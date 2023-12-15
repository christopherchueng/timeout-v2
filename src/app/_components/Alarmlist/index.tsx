import { RouterOutputs } from "@/trpc/shared";

type AlarmlistProps =
  RouterOutputs["alarmlist"]["getAlarmlistsByUserId"][number];

const Alarmlist = (alarmlist: AlarmlistProps) => {
  const { alarms } = alarmlist;
  return (
    <div>
      {alarmlist.name}
      {alarms.map((alarm) => (
        <div key={alarm.id}>{alarm.name}</div>
      ))}
    </div>
  );
};

export default Alarmlist;
