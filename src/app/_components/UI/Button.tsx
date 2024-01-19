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
      "border-slate-900 bg-slate-900 hover:bg-slate-700 active:bg-slate-800 dark:bg-white/80 dark:border-white/80 dark:text-slate-900 dark:hover:border-white dark:hover:bg-white dark:active:border-white/80 dark:active:bg-white/80":
        color === "primary",
      "border-gray-400 bg-gray-400 hover:opacity-80 active:opacity-90 dark:bg-zinc-600 dark:border-zinc-700 dark:text-white/70":
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
