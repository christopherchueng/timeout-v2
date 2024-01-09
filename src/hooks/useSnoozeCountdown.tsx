import { useTimeContext } from "@/context/Time";
import type { Alarm, Value, WeekdaysDataType } from "@/types";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

const useSnoozeCountdown = (
  terminalTime: Date | Dayjs | number,
  alarm: Alarm,
  weekdaysData: WeekdaysDataType,
) => {
  const { date, parts } = useTimeContext();
  const { hour, minute, second, meridiem } = parts;

  const currentDate = dayjs(date);

  const timeLeft = useMemo(
    () => dayjs(terminalTime).diff(currentDate),
    [terminalTime],
  );

  const isAlarmTriggered = useMemo(() => {
    const alarmMatchesTime =
      alarm.isOn &&
      alarm.hour === Number(hour) &&
      alarm.minutes === Number(minute) &&
      Number(second) === 0 &&
      alarm.meridiem === meridiem;

    if (!alarm.repeat) {
      return alarmMatchesTime;
    }

    const repeatDays = alarm.repeat.split(",").map((number) => {
      return weekdaysData[number as Value]!.value;
    });

    return repeatDays.includes(currentDate.get("day"));
  }, [alarm, hour, minute, meridiem, terminalTime]);

  const [isAlarmRinging, setIsAlarmRinging] = useState(isAlarmTriggered);

  useEffect(() => {
    if (timeLeft === 0 || isAlarmTriggered) setIsAlarmRinging(true);
  }, [timeLeft, isAlarmTriggered]);

  //   // 2 cases: For repeated days
  //   // If click on Snooze, then settimeout for 10 min
  //   // If click on Turn off, then just close modal and don't do anything else

  //   // No repeats
  //   // Only turn off will be allowed. Just close modal.

  //   // If stop button is clicked, close the snooze modal, snooze will be turned off, and countdown will be removed from local storage
  //   const handleCloseSnoozeModal = (e) => {
  //     e.preventDefault();
  //     setShowSnoozeModal(false);
  //     setIsAlarmRinging(false);
  //     window.localStorage.removeItem("snooze");
  //   };

  //   // If snooze button is clicked, modal will close, snooze will be turned on, and countdown will be set in state and in local storage
  //   const repeatSnooze = () => {
  //     setShowSnoozeModal(false);
  //     setIsAlarmRinging(true);
  //     setCountdown(10);
  //     window.localStorage.setItem("snooze", countdown);
  //   };

  return { isAlarmRinging, setIsAlarmRinging };
};

export default useSnoozeCountdown;
