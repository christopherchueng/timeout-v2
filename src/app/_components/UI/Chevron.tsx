import clsx from "clsx";

type ChevronProps = {
  isOpen: boolean;
  isToggleOn?: boolean;
};
const Chevron = ({ isOpen, isToggleOn }: ChevronProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    data-slot="icon"
    className={clsx(
      "h-3.5 w-3.5 -rotate-90 transition duration-75 dark:hover:stroke-white/70",
      isToggleOn
        ? "stroke-slate-900 dark:stroke-white/70"
        : "stroke-gray-400 dark:stroke-gray-400/40",
      isOpen && "rotate-0",
    )}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

export default Chevron;
