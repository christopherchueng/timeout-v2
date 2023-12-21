"use client";

import React from "react";
import { motion, useAnimate } from "framer-motion";

type SwitchProps = {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Switch = ({ id, checked, onChange }: SwitchProps) => {
  const [scope, animate] = useAnimate();
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

  const handleMouseDown = async () => {
    animate(`#ball_${id}`, { width: "1rem" });
  };

  const handleMouseUp = async () => {
    animate(`#ball_${id}`, { width: "0.75rem" });
  };

  return (
    <div className="flex w-8 justify-center">
      <label ref={scope} htmlFor={id} className="group relative w-full">
        <input
          id={id}
          className="invisible block duration-300 before:visible before:absolute before:-inset-1.5 before:left-0 before:my-auto before:h-5 before:w-8 before:cursor-pointer before:rounded-xl before:bg-gray-400 before:transition checked:before:bg-slate-900"
          type="checkbox"
          name="isOn"
          checked={checked}
          onChange={onChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
        <motion.div
          id={`ball_${id}`}
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
        />
      </label>
    </div>
  );
};
export default Switch;
