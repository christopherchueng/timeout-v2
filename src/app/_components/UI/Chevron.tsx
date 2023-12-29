import clsx from "clsx";

const Chevron = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    data-slot="icon"
    className={clsx(
      "h-4 w-4 -rotate-90 transition duration-75",
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
