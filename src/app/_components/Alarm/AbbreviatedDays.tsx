import { useMemo } from "react";
import clsx from "clsx";

type AbbreviatedDaysProps = {
  abbrDay: string;
  value: number;
  repeatedDays: string[] | undefined;
  isOn: boolean;
};

const AbbreviatedDays = ({
  abbrDay,
  value,
  repeatedDays,
  isOn,
}: AbbreviatedDaysProps) => {
  const activeSet = new Set<number | undefined>();
  const activeDays = useMemo(() => {
    if (!repeatedDays) return activeSet;

    // ['3', '4', '5']
    repeatedDays.forEach((number) => {
      if (Number(number) === value) activeSet.add(Number(value));
    });

    return activeSet;
  }, [repeatedDays]);

  return (
    <span
      className={clsx(
        "font-semibold transition",
        isOn && activeDays.has(value) ? "text-slate-900" : "text-gray-400",
      )}
    >
      {abbrDay[0]}
    </span>
  );
};

export default AbbreviatedDays;
