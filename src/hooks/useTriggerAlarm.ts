import { useMemo } from "react";
import dayjs from "dayjs";
import type { Alarm, Value } from "@/types";
import { weekdaysData } from "@/utils/constants";
import { parseHour } from "@/utils";

const useTriggerAlarm = (alarm: Alarm, is12HourMode: boolean) => {
  const currentDate = dayjs();

  const isAlarmTriggered = useMemo(() => {
    const currentHour = dayjs().format(is12HourMode ? "h" : "H");
    const alarmMatchesTime =
      alarm.isOn &&
      alarm.hour === parseHour(currentHour) &&
      alarm.minutes === dayjs().get("minute") &&
      dayjs().get("second") === 0;

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
