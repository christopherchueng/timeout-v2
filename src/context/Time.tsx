"use client";

import { createContext, useContext, useState, useEffect } from "react";
import dayjs, { type Dayjs } from "dayjs";

type TimeContextType = {
  currentDate: Dayjs;
  parts: Part;
};

export const TimeContext = createContext<TimeContextType | null>(null);

export const useTimeContext = () => {
  const context = useContext(TimeContext);

  if (!context) {
    throw new Error("useTimeContext must be used within a TimeContextProvider");
  }

  return context;
};

type Part = {
  hour: string | number;
  minute: string | number;
  second: string | number;
  meridiem: string;
  day: string;
};

type TimeProps = {
  children: React.ReactNode;
};

const TimeProvider = ({ children }: TimeProps) => {
  const currentDate = dayjs();
  const [parts, setParts] = useState<Part>({
    hour: "",
    minute: "",
    second: "",
    meridiem: "",
    day: "",
  });

  useEffect(() => {
    const timeInterval = setInterval(
      () =>
        setParts({
          hour: dayjs(currentDate).format("h"),
          minute: dayjs(currentDate).format("mm"),
          second: dayjs(currentDate).format("s"),
          meridiem: dayjs(currentDate).format("A"),
          day: dayjs(currentDate).format("ddd"),
        }),
      0,
    );

    return () => clearInterval(timeInterval);
  });

  return (
    <TimeContext.Provider value={{ parts, currentDate }}>
      {children}
    </TimeContext.Provider>
  );
};

export default TimeProvider;
