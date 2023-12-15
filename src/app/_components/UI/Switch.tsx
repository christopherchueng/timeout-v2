import clsx from "clsx";
import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

type SwitchProps = {
  checked: boolean;
  onChange: () => void;
};

const Switch = ({ checked, onChange }: SwitchProps) => {
  return (
    <div className="relative box-border flex w-12 justify-center">
      <label className="group absolute">
        <input
          className="peer invisible relative block before:visible before:absolute before:left-1 before:top-1 before:h-5 before:w-8 before:cursor-pointer before:rounded-xl before:bg-gray-400 before:transition checked:before:bg-slate-900"
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <div
          className={clsx(
            "absolute top-2 h-3 w-3 translate-x-2 cursor-pointer rounded-xl bg-white transition-all duration-100 active:pr-3.5 peer-checked:translate-x-5 peer-active:pr-3.5",
            {
              "right-0 active:w-3.5 peer-active:w-3.5": checked,
              "left-0": !checked,
            },
          )}
        />
      </label>
      {/* <div className={clsx({ "active:w-3.5": true, "-scale-x-1": checked })}>
        a
      </div> */}
    </div>
  );
};
export default Switch;
