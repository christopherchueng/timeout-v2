"use client";

import { createContext, useContext, useState, useEffect } from "react";
import dayjs from "dayjs";

type TimeContextType = {
  parts: Part;
};

type TimeProps = {
  children: React.ReactNode;
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
};

const TimeProvider = ({ children }: TimeProps) => {
  const date = new Date();
  const [parts, setParts] = useState<Part>({
    hour: "",
    minute: "",
    second: "",
    meridiem: "",
  });

  useEffect(() => {
    const timeInterval = setInterval(
      () =>
        setParts({
          hour: dayjs(date).format("h"),
          minute: dayjs(date).format("mm"),
          second: dayjs(date).format("s"),
          meridiem: dayjs(date).format("A"),
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
