"use client";

import React from "react";
import { motion } from "framer-motion";

type SwitchProps = {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Switch = ({ id, checked, onChange }: SwitchProps) => {
  const variants = {
    checked: {
      x: ["0.25rem", "1rem"],
      right: "1.25rem",
      left: "auto",
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    unchecked: {
      x: ["1rem", "0.25rem"],
      left: "0px",
      right: "auto",
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  return (
    <div className="flex w-8 justify-center">
      <label htmlFor={id} className="group relative w-full">
        <input
          id={id}
          className="switch peer invisible block duration-300 before:visible before:absolute before:-inset-1.5 before:left-0 before:my-auto before:h-5 before:w-8 before:cursor-pointer before:rounded-xl before:bg-gray-400 before:transition checked:before:bg-slate-900"
          type="checkbox"
          name="isOn"
          checked={checked}
          onChange={onChange}
        />
        <motion.div
          whileTap={{
            width: "1rem",
          }}
          style={{
            left: `${!checked && "0px"}`,
            right: `${checked && "1.25rem"}`,
          }}
          variants={variants}
          animate={checked ? "checked" : "unchecked"}
          className="absolute inset-y-0 my-auto h-3 w-3 cursor-pointer rounded-xl bg-white"
          // className="absolute inset-y-0 left-0 right-auto my-auto h-3 w-3 translate-x-1 cursor-pointer rounded-xl bg-white transition-all duration-300 ease-in-out active:w-4 peer-checked:left-auto peer-checked:right-5 peer-checked:translate-x-4 peer-active:w-4"
        />
      </label>
    </div>
  );
};
export default Switch;
