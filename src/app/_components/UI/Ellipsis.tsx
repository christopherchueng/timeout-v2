import clsx from "clsx";

const Ellipsis = (props: { isSettingsTabOpen: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className={clsx(
      props.isSettingsTabOpen && "bg-gray-300 dark:bg-zinc-500",
      "h-6 w-6 cursor-pointer rounded border border-transparent p-1 transition hover:bg-gray-300 active:bg-gray-400 group-hover:z-10 group-hover:block dark:hover:bg-zinc-500 dark:active:bg-zinc-500/70",
    )}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
);

export default Ellipsis;
