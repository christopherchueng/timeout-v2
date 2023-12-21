import React from "react";
import clsx from "clsx";

type TooltipProps = {
  text: string;
  children?: React.ReactNode;
};

const Tooltip = ({ text, children }: TooltipProps) => {
  const classes = clsx(
    `
      ${
        text && "animate-dilate"
      } absolute -bottom-16 z-50 whitespace-nowrap rounded border px-2 py-1.5 text-xs transition-all delay-75 duration-300`,
  );
  return (
    <div className="group relative inline-block">
      {children}
      <span className={classes}>{text}</span>
    </div>
  );
};

export default Tooltip;
