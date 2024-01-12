"use client";

import { createContext, useContext, useState, useEffect } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { api } from "@/trpc/react";

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
  meridiem: string | undefined;
  day: string;
};

type TimeProps = {
  children: React.ReactNode;
};

const TimeProvider = ({ children }: TimeProps) => {
  const { data: preferences } = api.preference.get.useQuery();

  const currentDate = dayjs();
  const [parts, setParts] = useState<Part>({
    hour: "",
    minute: "",
    second: "",
    meridiem: undefined,
    day: "",
  });

  useEffect(() => {
    if (!preferences) return;

    const timeInterval = setInterval(
      () =>
        setParts({
          hour: dayjs(currentDate).format(preferences.use12Hour ? "h" : "H"),
          minute: dayjs(currentDate).format("mm"),
          second: dayjs(currentDate).format("s"),
          meridiem: preferences.use12Hour
            ? dayjs(currentDate).format("A")
            : undefined,
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
