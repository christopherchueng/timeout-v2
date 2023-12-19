import clsx from "clsx";

type ClockProps = {
  size: "sm" | "lg";
};

const Loading = ({ size = "lg" }: ClockProps) => {
  return (
    <div className="flex w-fit flex-row">
      <div
        className={clsx("animate-pulse bg-gray-200", {
          "h-7 w-16 rounded-md": size === "sm",
          "h-24 w-96 rounded-lg": size === "lg",
        })}
      />
    </div>
  );
};

export default Loading;
