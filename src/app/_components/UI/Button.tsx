import clsx from "clsx";
import React from "react";

type ButtonProps = {
  width?: string;
  onClick: () => void;
  children: React.ReactNode;
};

const Button = ({ width, children, onClick }: ButtonProps) => {
  const buttonClassNames = clsx();
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center whitespace-nowrap rounded border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700 active:bg-slate-800"
    >
      {children}
    </button>
  );
};

export default Button;
