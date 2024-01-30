import clsx from "clsx";

type TooltipProps = {
  text: string;
  color?: "default" | "primary" | "error";
  placement?: "right" | "bottom";
  isShowing: boolean;
  children?: React.ReactNode;
};

const Tooltip = ({
  text,
  color = "primary",
  placement = "bottom",
  isShowing,
  children,
}: TooltipProps) => {
  const classNames = clsx(
    "absolute w-fit mx-auto z-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white/70 animate-dilate whitespace-nowrap rounded border px-2 py-1.5 text-xs transition duration-75",
    placement === "bottom" && "inset-x-0 -bottom-9 -left-3.5",
    placement === "right" && "inset-y-0 left-4 my-auto h-fit",
    color === "default" && "bg-gray-50",
    color === "primary" && "bg-white",
    color === "error" && "bg-red-100 text-red-700 border-red-100",
  );
  return (
    <div className="relative flex h-full items-center">
      {children}
      {isShowing && <span className={classNames}>{text}</span>}
    </div>
  );
};

export default Tooltip;
