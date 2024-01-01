type TooltipProps = {
  text: string;
  children?: React.ReactNode;
};

const Tooltip = ({ text, children }: TooltipProps) => {
  return (
    <div className="relative inline-block">
      {children}
      <span className="absolute -bottom-16 -left-4 z-50 animate-dilate whitespace-nowrap rounded border px-2 py-1.5 text-xs transition duration-75">
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
