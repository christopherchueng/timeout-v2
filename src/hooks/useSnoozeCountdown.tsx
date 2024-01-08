import { useTimeContext } from "@/context/Time";
import type { Alarm } from "@/types";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

const useSnoozeCountdown = (
  terminalTime: Date | Dayjs | number,
  alarm: Alarm,
) => {
  const { date, parts } = useTimeContext();
  const { hour, minute, second, meridiem } = parts;

  const initialTime = dayjs(date);

  const timeLeft = useMemo(
    () => dayjs(terminalTime).diff(initialTime),
    [terminalTime],
  );

  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  const checkTime = useMemo(() => {
    return (
      alarm.isOn &&
      alarm.hour === Number(hour) &&
      alarm.minutes === Number(minute) &&
      Number(second) === 0 &&
      alarm.meridiem === meridiem
    );
  }, [alarm, hour, minute, meridiem]);

  useEffect(() => {
    if (timeLeft === 0 || checkTime) setIsAlarmRinging(true);
  }, [timeLeft, checkTime]);

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
