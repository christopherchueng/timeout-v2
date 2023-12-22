import React, { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name?: string;
  label?: string;
  error?: string;
  testId?: string;
  value?: string;
  placeholder?: string;
  register?: any;
}

const Input = ({
  name,
  label,
  error,
  testId,
  value,
  register,
  placeholder,
  ...rest
}: InputProps) => {
  return (
    <label
      htmlFor={label}
      className="row-reverse relative mb-1 flex w-48 translate-y-0 cursor-text items-center border-b border-b-gray-400 transition focus-within:border-b-slate-900"
    >
      <input
        {...register(name)}
        id={name}
        data-testid={testId}
        className="peer w-full bg-transparent pb-1.5 pt-4 text-xs outline-none"
        {...rest}
      />
      <span
        className={clsx(
          "group:-translate-y-3.5 group:pt-1 empty:translate-y-0! pointer-events-none absolute left-0 top-3 select-none text-slate-900 transition-all placeholder:text-white peer-focus:-translate-y-3 peer-focus:pt-1 peer-focus:text-2xs",
          // Show placeholder above value if input is filled out and user clicks out of input field
          value ? "-translate-y-3 pt-1 text-2xs" : "text-xs",
        )}
      >
        {placeholder}
      </span>
    </label>
  );
};

export default Input;
