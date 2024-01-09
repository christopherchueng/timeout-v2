import { useMemo } from "react";
import type { Alarm, Value } from "@/types";
import dayjs from "dayjs";
import { useTimeContext } from "@/context/Time";
import { weekdaysData } from "@/utils/constants";

const useTriggerAlarm = (alarm: Alarm) => {
  const { currentDate } = useTimeContext();

  const isAlarmTriggered = useMemo(() => {
    const currentHour = dayjs().get("hour");
    const alarmMatchesTime =
      alarm.isOn &&
      alarm.hour === (currentHour % 12 || 12) &&
      alarm.minutes === dayjs().get("minute") &&
      dayjs().get("second") === 0 &&
      alarm.meridiem === (currentHour >= 12 && currentHour <= 23 ? "PM" : "AM");

    if (!alarm.repeat) {
      return alarmMatchesTime;
    }

    const repeatDays = alarm.repeat.split(",").map((number) => {
      return weekdaysData[number as Value]!.value;
    });

    return alarmMatchesTime && repeatDays.includes(currentDate.get("day") + 1);
  }, [currentDate]);

  return { isAlarmTriggered };
};

export default useTriggerAlarm;
