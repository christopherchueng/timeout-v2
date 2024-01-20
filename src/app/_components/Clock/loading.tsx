import clsx from "clsx";

type ClockProps = {
  size: "sm" | "md" | "lg";
};

const Loading = ({ size = "lg" }: ClockProps) => {
  return (
    <div className="flex w-fit flex-row">
      <div
        className={clsx("animate-pulse bg-gray-200 dark:bg-zinc-700", {
          "h-7 w-16 rounded-md": size === "sm",
          "rounded-lg sm:h-20 sm:w-64 md:h-24 md:w-96": size === "lg",
        })}
      />
    </div>
  );
};

export default Loading;
