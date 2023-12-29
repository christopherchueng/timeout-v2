import clsx from "clsx";

type AlarmlistIconProps = {
  isOn: boolean;
};

const AlarmlistIcon = ({ isOn }: AlarmlistIconProps) => (
  <svg
    fill="currentColor"
    className={clsx(
      "h-3.5 w-3.5 transition",
      isOn ? "fill-slate-900" : "fill-gray-400",
    )}
    viewBox="0 0 32 32"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>folder-blank</title>
    <path d="M30 7.32h-11.51l-5.64-5.236c-0.222-0.207-0.522-0.334-0.851-0.334 0 0-0 0-0 0h-10c-0.69 0-1.25 0.56-1.25 1.25v0 26c0 0.69 0.56 1.25 1.25 1.25h28c0.69-0.001 1.249-0.56 1.25-1.25v-20.43c-0-0.69-0.56-1.25-1.25-1.25h-0zM28.75 27.75h-25.5v-23.5h8.259l5.641 5.236c0.222 0.207 0.522 0.334 0.851 0.334 0 0 0 0 0 0h10.75z"></path>
  </svg>
);

export default AlarmlistIcon;
