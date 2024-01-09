import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import duration from "dayjs/plugin/duration";
import { saveTimeInLocalStorage, getTimeFromLocalStorage } from "@/utils";

dayjs.extend(duration);

const useSnoozeCountdown = (endTime: Dayjs) => {
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(
    Number(getTimeFromLocalStorage()),
  );
  const [snoozed, setSnoozed] = useState(false);

  // Snooze registered in local storage
  useEffect(() => {
    // If snooze is clicked and turned on, then start the snooze countdown
    if (snoozed) {
      // This updates the countdown in local storage every second
      const timer = setInterval(
        () =>
          setTimeLeft((prev) => {
            if (prev > 0) {
              saveTimeInLocalStorage(timeLeft.toString());
              return prev - 1;
            } else {
              // If countdown hits 0, then show the snooze modal.
              setIsAlarmRinging(true);
              setSnoozed(false);
              return prev;
            }
          }),
        1000,
      );
      return () => clearInterval(timer);
    }
  }, [timeLeft, endTime, snoozed]);

  useEffect(() => {
    if (snoozed) {
      setTimeLeft(endTime.diff(dayjs(), "seconds"));
      saveTimeInLocalStorage(timeLeft.toString());
    }
  }, [snoozed]);

  return {
    timeLeft,
    setSnoozed,
    isAlarmRinging,
    setIsAlarmRinging,
  };
};

export default useSnoozeCountdown;
