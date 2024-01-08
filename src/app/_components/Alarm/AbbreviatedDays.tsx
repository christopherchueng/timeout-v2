import clsx from "clsx";
import { useMemo } from "react";

type AbbreviatedDaysProps = {
  day: string;
  abbrDay: string;
  value: number;
  repeatedDays: string[] | undefined;
  isOn: boolean;
};

const AbbreviatedDays = ({
  day,
  abbrDay,
  value,
  repeatedDays,
  isOn,
}: AbbreviatedDaysProps) => {
  const activeSet = new Set<number | undefined>();
  const activeDays = useMemo(() => {
    if (!repeatedDays) return activeSet;

    repeatedDays.forEach((repeatDay) => {
      if (repeatDay === day) activeSet.add(value);
    });

    return activeSet;
  }, [repeatedDays]);

  return (
    <span
      className={clsx(
        "transition",
        isOn && activeDays.has(value)
          ? "font-semibold text-slate-900"
          : "text-gray-400",
      )}
    >
      {abbrDay}
    </span>
  );
};

export default AbbreviatedDays;
