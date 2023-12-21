import React from "react";
import clsx from "clsx";

type InputProps = {
  children?: React.ReactNode;
  value?: string;
  placeholder?: string;
  name?: string;
  type?: string;
  required?: boolean;
  testId?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({
  children,
  value,
  placeholder,
  name,
  type,
  required,
  testId,
  onChange,
}: InputProps) => {
  return (
    <>
      <label
        htmlFor={name}
        className="row-reverse relative mb-1 flex w-48 translate-y-0 cursor-text items-center border-b border-b-gray-400 transition focus-within:border-b-slate-900"
      >
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          required={required}
          data-testid={testId}
          className="peer w-full bg-transparent pb-1.5 pt-4 text-xs outline-none"
          onChange={onChange}
        />
        {children}
        <span
          className={clsx(
            "group:-translate-y-3.5 group:pt-1 pointer-events-none absolute left-0 top-3 select-none text-xs text-slate-900 transition-all placeholder:text-white peer-focus:-translate-y-3 peer-focus:pt-1 peer-focus:text-2xs",
            // Show placeholder above value if input is filled out and user clicks out of input field
            value && "-translate-y-3 pt-1 text-xs",
          )}
        >
          {placeholder}
        </span>
      </label>
    </>
  );
};

export default Input;
