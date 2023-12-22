import clsx from "clsx";
import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children, ...props }: ButtonProps) => {
  // const buttonClassNames = clsx();
  return (
    <button
      {...props}
      className="flex items-center justify-center whitespace-nowrap rounded border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700 active:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {children}
    </button>
  );
};

export default Button;
