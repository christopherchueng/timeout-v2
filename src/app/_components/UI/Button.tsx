import { type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: "default" | "primary";
}

const Button = ({ children, color = "primary", ...props }: ButtonProps) => {
  const buttonClassNames = clsx(
    "flex select-none items-center justify-center whitespace-nowrap rounded px-3 py-1.5 text-xs text-white transition disabled:cursor-not-allowed disabled:bg-gray-300",
    {
      "border-slate-900 bg-slate-900 hover:bg-slate-700 active:bg-slate-800 dark:bg-slate-600 dark:border-slate-600 dark:hover:bg-slate-600/70 dark:active:bg-slate-600/40":
        color === "primary",
      "border-gray-400 bg-gray-400 hover:opacity-80 active:opacity-90":
        color === "default",
    },
  );
  return (
    <button {...props} className={buttonClassNames}>
      {children}
    </button>
  );
};

export default Button;
