import { useMemo } from "react";
import type { Alarm, Value } from "@/types";
import { weekdaysData } from "@/utils/constants";
import { useTimeContext } from "@/context/Time";

const useTriggerAlarm = (alarm: Alarm) => {
  const { currentDate, parts } = useTimeContext();
  const { minute, second } = parts;

  const isAlarmTriggered = useMemo(() => {
    const alarmMatchesTime =
      alarm.isOn &&
      alarm.hour === Number(currentDate.format("H")) &&
      alarm.minutes === Number(minute) &&
      Number(second) === 0;

    if (!alarm.repeat) {
      return alarmMatchesTime;
    }

    const repeatDays = alarm.repeat.split(",").map((number) => {
      return weekdaysData[number as Value]!.value;
    });

    return alarmMatchesTime && repeatDays.includes(currentDate.get("day") + 1);
  }, [currentDate, minute, second]);

  return { isAlarmTriggered };
};

export default useTriggerAlarm;
