"use client";

import { useTimeContext } from "@/context/TimeContext";

const Clock = () => {
  const { parts } = useTimeContext();
  const { hour, colon, minute, second, meridiem } = parts;
  return (
    <div>
      {hour}
      {colon}
      {minute}
      {meridiem}
    </div>
  );
};

export default Clock;
