import clsx from "clsx";
import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: "default" | "primary";
}

const Button = ({ children, color = "primary", ...props }: ButtonProps) => {
  const buttonClassNames = clsx(
    "flex select-none items-center justify-center whitespace-nowrap rounded px-3 py-1.5 text-xs text-white transition disabled:cursor-not-allowed disabled:bg-gray-300",
    {
      "border-slate-900 bg-slate-900 hover:bg-slate-700 active:bg-slate-800":
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
