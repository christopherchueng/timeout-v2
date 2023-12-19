"use client";

import { createContext, useContext, useState, useEffect } from "react";
import dayjs from "dayjs";

type TimeContextType = {
  parts: Part;
};

type TimeProps = {
  children: React.ReactNode;
};

export const TimeContext = createContext<TimeContextType>(
  {} as TimeContextType,
);

export const useTimeContext = () => useContext(TimeContext);

type Part = {
  hour: string | number;
  colon: string;
  minute: string | number;
  second: string | number;
  meridiem: string;
};

const TimeProvider = ({ children }: TimeProps) => {
  const date = new Date();
  const [parts, setParts] = useState<Part>({
    hour: "",
    colon: "",
    minute: "",
    second: "",
    meridiem: "",
  });

  useEffect(() => {
    const timeInterval = setInterval(
      () =>
        setParts({
          hour: dayjs(date).get("hour"),
          colon: ":",
          // colon: +parts.second % 2 === 1 ? ":" : "",
          minute:
            dayjs(date).get("minute") < 10
              ? "0" + dayjs(date).get("minute")
              : dayjs(date).get("minute"),
          second: dayjs(date).get("second"),
          meridiem: +parts.hour >= 12 ? "PM" : "AM",
        }),
      0,
    );

    return () => clearInterval(timeInterval);
  });

  return (
    <TimeContext.Provider value={{ parts }}>{children}</TimeContext.Provider>
  );
};

export default TimeProvider;
