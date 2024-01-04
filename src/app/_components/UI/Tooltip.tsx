import clsx from "clsx";

type TooltipProps = {
  text: string;
  color?: "default" | "error";
  isShowing: boolean;
  children?: React.ReactNode;
};

const Tooltip = ({
  text,
  color = "default",
  isShowing,
  children,
}: TooltipProps) => {
  const classNames = clsx(
    "absolute inset-x-0 w-fit mx-auto -bottom-9 -left-4 z-50 animate-dilate whitespace-nowrap rounded border px-2 py-1.5 text-xs transition duration-75",
    color === "default" && "bg-white",
    color === "error" && "bg-red-100 text-red-700 border-red-100",
  );
  return (
    <div className="relative">
      {children}
      {isShowing && <span className={classNames}>{text}</span>}
    </div>
  );
};

export default Tooltip;
