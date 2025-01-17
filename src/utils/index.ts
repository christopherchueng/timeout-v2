import { type MutableRefObject, type RefCallback } from "react";
import { z } from "zod";
import type { SelectedItems } from "@nextui-org/select";
import { Meridiem, type Value } from "@/types";
import { weekdaysData } from "./constants";

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
  hour: z
    .string()
    .or(
      z
        .number()
        .gte(0, { message: "Invalid hour input." })
        .lte(23, { message: "Invalid hour input." })
        .int(),
    ),
  minutes: z
    .string()
    .or(
      z
        .number()
        .gte(0, { message: "Minutes must be in between 0 and 59." })
        .lte(59, { message: "Minutes must be in between 0 and 59." })
        .int(),
    ),
  meridiem: z
    .nativeEnum(Meridiem, {
      errorMap: () => ({ message: "Please select AM or PM." }),
    })
    .optional(),
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

const isArrayOfStrings = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) &&
    !!value.length &&
    value.every((item) => typeof item === "string")
  );
};

export const formatRepeatDays = (
  days: SelectedItems<object> | string[],
): string => {
  if (!days.length) return "";
  if (days.length === 7) return "Every day";

  let lastDay: string | undefined | null = null;
  let isWeekend: boolean | null = null;
  let isWeekday: boolean | null = null;

  if (!isArrayOfStrings(days)) {
    const sortedDays = [...days].sort((a, b) => {
      return a.props!.value - b.props!.value;
    });

    if (!sortedDays[0]?.textValue) return "";

    if (sortedDays.length === 1) return sortedDays[0].textValue;

    isWeekend = sortedDays.every(
      (day) => day.textValue === "Sun" || day.textValue === "Sat",
    );

    if (isWeekend) {
      return "Weekends";
    }

    isWeekday =
      sortedDays.length === 5 &&
      sortedDays.every(
        (day) => day.textValue !== "Sun" && day.textValue !== "Sat",
      );

    if (isWeekday) {
      return "Weekdays";
    }

    const formattedDays = sortedDays.map((day) => day.textValue);
    lastDay = formattedDays.pop();

    return `${formattedDays.join(", ")}${
      formattedDays.length >= 2 ? "," : ""
    } and ${lastDay}`;
  } else {
    if (!days[0]) return "";

    if (days.length === 1) return weekdaysData[days[0] as Value]!.abbr;

    isWeekend = days.every((day) => Number(day) === 6 || Number(day) === 7);

    if (isWeekend) {
      return "Weekends";
    }

    isWeekday =
      days.length === 5 &&
      days.every((day) => Number(day) !== 6 || Number(day) !== 7);

    if (isWeekday) {
      return "Weekdays";
    }

    return "Individual";
  }
};

export const formatMinutes = (minute: string | number): string | number => {
  return Number(minute) < 10 ? `0${minute}` : minute;
};

export const parseHour = (hour: string | number): number =>
  typeof hour === "string" ? Number(hour) : hour;

export const parseMinutes = (minutes: string | number): number =>
  typeof minutes === "string" ? Number(minutes) : minutes;

export const verifyNumericalInput = (
  e: React.KeyboardEvent<HTMLInputElement> & { type: "keydown" },
  field: "hour" | "minutes",
  is12HourMode: boolean,
) => {
  if (e.type === "keydown") {
    const allowedKeys =
      /^[0-9]$|Backspace|Arrow(Left|Right|Up|Down)|Delete|Tab|Home|End$/;

    if (!allowedKeys.test(e.key)) {
      e.preventDefault();
    }
  }

  const previousValue = e.currentTarget.value;
  const currentValue = e.key;
  const isEmptyInputValue = previousValue.length === 0;

  if (field === "minutes") {
    const isFirstDigitOutOfBounds =
      previousValue.length === 1 && Number(previousValue) > 5;
    const isInBetweenFiveAndTenWithLeadingZero =
      previousValue.length === 2 &&
      Number(previousValue) > 5 &&
      Number(previousValue) < 10;
    const isMinutesInBounds =
      Number(previousValue) >= 10 && Number(previousValue) < 60;

    const insertLeadingZeroToMinutes =
      !isNaN(Number(currentValue)) &&
      (isEmptyInputValue ||
        isFirstDigitOutOfBounds ||
        isInBetweenFiveAndTenWithLeadingZero ||
        isMinutesInBounds);

    if (insertLeadingZeroToMinutes) {
      return (e.currentTarget.value = `0${currentValue}`);
    }

    const enteredValueAfterValidFirstDigit =
      Number(previousValue) < 6 && !isNaN(Number(currentValue));

    if (enteredValueAfterValidFirstDigit) {
      // If first digit is within valid minute value
      // Then will append second digit to form a valid value
      e.currentTarget.value = `${Number(previousValue)}${currentValue}`;
    }
  }

  if (field === "hour") {
    if (is12HourMode) {
      const hourIsGreaterThan12AndLessThan20 =
        previousValue.length === 1 &&
        Number(previousValue) === 1 &&
        !isNaN(Number(currentValue)) &&
        Number(currentValue) > 2;

      const hourIsGreaterThan19 =
        Number(previousValue) !== 1 && !isNaN(Number(currentValue));

      if (hourIsGreaterThan12AndLessThan20 || hourIsGreaterThan19) {
        e.currentTarget.value = "";
      }
    } else {
      const isFirstDigitOutOfBounds =
        previousValue.length === 1 && Number(previousValue) > 2;
      const isSecondDigitOutOfBounds =
        previousValue.length === 2 &&
        Number(previousValue) === 2 &&
        Number(currentValue) > 3;
      const isInBetweenThreeAndTenWithLeadingZero =
        previousValue.length === 2 &&
        Number(previousValue) > 2 &&
        Number(previousValue) < 10;
      const isHourInBounds =
        Number(previousValue) >= 10 && Number(previousValue) < 24;

      const insertLeadingZeroToHour =
        !isNaN(Number(currentValue)) &&
        (isEmptyInputValue ||
          isFirstDigitOutOfBounds ||
          isInBetweenThreeAndTenWithLeadingZero ||
          isHourInBounds ||
          isSecondDigitOutOfBounds);

      if (insertLeadingZeroToHour) {
        e.currentTarget.value = `0${currentValue}`;
      }

      const isLessThan20 = Number(previousValue) < 2;
      const isInBetween20And24 =
        Number(previousValue) === 2 && Number(currentValue) < 4;

      const enteredValueAfterValidFirstDigit =
        !isNaN(Number(currentValue)) && (isLessThan20 || isInBetween20And24);

      if (enteredValueAfterValidFirstDigit) {
        e.currentTarget.value = `${Number(previousValue)}${currentValue}`;
      }
    }
  }
};

export const saveTimeInLocalStorage = (time: string) => {
  localStorage.setItem("snoozeCountdown", time);
};

export const getTimeFromLocalStorage = () => {
  return localStorage.getItem("snoozeCountdown");
};

export const convertHourTo24HourMode = (
  hour: number,
  meridiem: Meridiem,
  is12HourMode: boolean,
): number => {
  if (!is12HourMode || !meridiem) {
    return hour;
  }
  // Convert 12 hour mode to 24 hour mode
  if (hour === 12 && meridiem === ("AM" as Meridiem)) return 0;

  if (hour < 12 && meridiem === ("PM" as Meridiem)) return hour + 12;

  return hour;
};
