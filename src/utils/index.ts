import type { SelectedItems } from "@nextui-org/select";
import { type MutableRefObject, type RefCallback } from "react";
import { z } from "zod";

// Alarmlist schemas
const nameSchema = {
  name: z
    .string()
    .trim()
    .min(1, { message: "Please enter a name." })
    .max(20, { message: "Name must contain at most 20 character(s)." }),
};
export const createAlarmlistSchema = z.object({
  ...nameSchema,
});

export const renameAlarmlistSchema = z.object({
  id: z.string(),
  ...nameSchema,
});

// Alarm schemas
export const alarmSchema = {
  name: z.string().optional().default("Alarm"),
  hour: z.string().or(z.number().gt(0).lt(13).int()),
  minutes: z.string().or(z.number().gte(0).lt(60).int()),
  meridiem: z.string(),
  sound: z.string().optional(),
  repeat: z.string().optional(),
  snooze: z.boolean(),
  alarmlistId: z.string(),
  userId: z.string(),
};

export const createAlarmSchema = z.object({
  ...alarmSchema,
});

export const updateAlarmSchema = z.object({
  id: z.string(),
  ...alarmSchema,
});

type MutableRefList<T> = Array<
  RefCallback<T> | MutableRefObject<T> | undefined | null
>;

export function mergeRefs<T>(...refs: MutableRefList<T>): RefCallback<T> {
  return (val: T) => {
    setRef(val, ...refs);
  };
}

export function setRef<T>(val: T, ...refs: MutableRefList<T>): void {
  refs.forEach((ref) => {
    if (typeof ref === "function") {
      ref(val);
    } else if (ref) {
      ref.current = val;
    }
  });
}

export const repeatDays = (days: SelectedItems<object>): string => {
  if (!days.length) return "";

  const sortedDays = [...days].sort((a, b) => {
    return a.props!.value - b.props!.value;
  });

  if (!sortedDays[0]?.textValue) return "";

  if (days.length === 1) return sortedDays[0].textValue;
  if (days.length === 7) return "Every day";

  const isWeekend = sortedDays.every(
    (day) => day.textValue === "Sun" || day.textValue === "Sat",
  );

  if (isWeekend) {
    return "Weekends";
  }

  const isWeekday =
    sortedDays.length === 5 &&
    sortedDays.every(
      (day) => day.textValue !== "Sun" && day.textValue !== "Sat",
    );

  if (isWeekday) {
    return "Weekdays";
  }

  const formattedDays = sortedDays.map((day) => day.textValue);
  const lastDay = formattedDays.pop();

  if (formattedDays.length >= 3) {
    return `${formattedDays.join(", ")}, and ${lastDay}`;
  }
  if (formattedDays.length) {
    return `${formattedDays.join(", ")} and ${lastDay}`;
  }

  return lastDay ?? "";
};

export const formatMinutes = (minute: string | number) => {
  return Number(minute) < 10 ? `0${minute}` : minute;
};
