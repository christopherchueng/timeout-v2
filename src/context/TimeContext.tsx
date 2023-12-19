"use client";

import { createContext, useContext, useState, useEffect } from "react";
import dayjs from "dayjs";

type TimeContextType = {
  parts: Time;
};

type TimeProps = {
  children: React.ReactNode;
};

export const TimeContext = createContext<TimeContextType>(
  {} as TimeContextType,
);

export const useTimeContext = () => useContext(TimeContext);

type Time = {
  hour: string | number;
  colon: string;
  minute: string | number;
  second: string | number;
  meridiem: string;
};

const TimeProvider = ({ children }: TimeProps) => {
  const date = new Date();
  const [parts, setParts] = useState<Time>({
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
          colon: +parts.second % 2 === 1 ? ":" : "",
          minute: dayjs(date).get("minute"),
          second: dayjs(date).get("second"),
          meridiem: +parts.hour >= 12 ? "PM" : "AM",
        }),
      1000,
    );

    return () => clearInterval(timeInterval);
  });

  return (
    <TimeContext.Provider value={{ parts }}>{children}</TimeContext.Provider>
  );
};

export default TimeProvider;
