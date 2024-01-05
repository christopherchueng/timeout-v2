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

export enum Meridiem {
  AM = "AM",
  PM = "PM",
}

// Alarm schemas
export const alarmSchema = {
  name: z.string().optional().default("Alarm"),
  hour: z
    .number()
    .gte(1, { message: "Hours must be in between 1 and 12." })
    .lte(12, { message: "Hours must be in between 1 and 12." })
    .int(),
  minutes: z
    .string()
    .or(
      z
        .number()
        .gte(0, { message: "Minutes must be in between 0 and 59." })
        .lte(59, { message: "Minutes must be in between 0 and 59." })
        .int(),
    ),
  meridiem: z.nativeEnum(Meridiem, {
    errorMap: () => ({ message: "Please select AM or PM." }),
  }),
  sound: z.string().optional(),
  repeat: z.string().optional(),
  snooze: z.boolean({
    required_error: "Snooze is required.",
    invalid_type_error: "Snooze must be on or off.",
  }),
  // Weird react hook form/zod behavior:
  // On initial render, required_error will be displayed
  // If user exits and reopens form, min validation will be displayed.
  alarmlistId: z
    .string({ required_error: "Please select an alarmlist." })
    .min(1, { message: "Please select an alarmlist." }),
  userId: z
    .string({ required_error: "Please provide a user id." })
    .min(1, { message: "Please provide a user id." }),
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

export const formatMinutes = (minute: string | number): string | number => {
  return Number(minute) < 10 ? `0${minute}` : minute;
};

export const parseHour = (hour: string | number): number =>
  typeof hour === "string" ? Number(hour) : hour;

export const parseMinutes = (minutes: string | number): number =>
  typeof minutes === "string" ? Number(minutes) : minutes;
