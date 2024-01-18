"use client";

import { Switch as SwitchComponent } from "@nextui-org/switch";
import { extendVariants } from "@nextui-org/system";
import { MoonIcon, SunIcon } from ".";

type SwitchProps = {
  id: string;
  size?: "xs" | "sm" | "md" | "lg";
  checked: boolean;
  showIcon?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// @see links for customization:
// https://github.com/nextui-org/nextui/blob/main/packages/core/theme/src/components/toggle.ts
// https://nextui.org/docs/customization/custom-variants

export const MySwitch = extendVariants(SwitchComponent, {
  slots: {
    base: "group relative max-w-fit inline-flex items-center justify-start cursor-pointer touch-none tap-highlight-transparent",
    wrapper: [
      "px-1",
      "relative",
      "inline-flex",
      "items-center",
      "justify-start",
      "flex-shrink-0",
      "overflow-hidden",
      "bg-default-200",
      "rounded-full",
      // focus ring
      // ...groupDataFocusVisibleClasses,
    ],
    thumb: [
      "z-10",
      "flex",
      "items-center",
      "justify-center",
      "bg-white",
      "shadow-small",
      "rounded-full",
      "origin-right",
    ],
    startContent: "z-0 absolute left-1.5 text-current",
    endContent: "z-0 absolute right-1.5 text-default-600",
    thumbIcon: "text-black",
    label: "relative text-foreground select-none",
  },
  variants: {
    color: {
      default: {
        wrapper: [
          "bg-gray-300",
          "dark:bg-gray-400",
          "group-data-[selected=true]:bg-slate-900",
          "dark:group-data-[selected=true]:bg-slate-700",
          "group-data-[selected=true]:text-primary-foreground",
        ],
      },
      primary: {
        wrapper: [
          "group-data-[selected=true]:bg-primary",
          "group-data-[selected=true]:text-primary-foreground",
        ],
      },
      secondary: {
        wrapper: [
          "group-data-[selected=true]:bg-secondary",
          "group-data-[selected=true]:text-secondary-foreground",
        ],
      },
      success: {
        wrapper: [
          "group-data-[selected=true]:bg-success",
          "group-data-[selected=true]:text-success-foreground",
        ],
      },
      warning: {
        wrapper: [
          "group-data-[selected=true]:bg-warning",
          "group-data-[selected=true]:text-warning-foreground",
        ],
      },
      danger: {
        wrapper: [
          "group-data-[selected=true]:bg-danger",
          "data-[selected=true]:text-danger-foreground",
        ],
      },
    },
    disableAnimation: {
      true: {
        wrapper: "transition-none",
        thumb: "transition-none",
      },
      false: {
        wrapper: "transition-background",
        thumb: "transition-all",
        startContent: [
          "opacity-0",
          "scale-50",
          "transition-transform-opacity",
          "group-data-[selected=true]:scale-100",
          "group-data-[selected=true]:opacity-100",
        ],
        endContent: [
          "opacity-100",
          "transition-transform-opacity",
          "group-data-[selected=true]:translate-x-3",
          "group-data-[selected=true]:opacity-0",
        ],
      },
    },
    size: {
      xs: {
        wrapper: "w-8 h-5 mr-0.5",
        thumb: [
          "w-3 h-3 text-tiny",
          //selected
          "group-data-[selected=true]:ml-3",
        ],
        endContent: "text-small",
        startContent: "text-small",
        label: "text-small",
      },
      sm: {
        wrapper: "w-10 h-6 mr-2",
        thumb: [
          "w-4 h-4 text-tiny",
          //selected
          "group-data-[selected=true]:ml-4",
        ],
        endContent: "text-tiny",
        startContent: "text-tiny",
        label: "text-small",
      },
      md: {
        wrapper: "w-12 h-7 mr-2",
        thumb: [
          "w-5 h-5 text-small",
          //selected
          "group-data-[selected=true]:ml-5",
        ],
        endContent: "text-small",
        startContent: "text-small",
        label: "text-medium",
      },
      lg: {
        wrapper: "w-14 h-8 mr-2",
        thumb: [
          "w-6 h-6 text-medium",
          //selected
          "group-data-[selected=true]:ml-6",
        ],
        endContent: "text-medium",
        startContent: "text-medium",
        label: "text-large",
      },
    },
  },
  defaultVariants: {
    color: "default",
    disableAnimation: "false",
  },
  compoundVariants: [
    {
      disableAnimation: false,
      size: "xs",
      class: {
        /** @ts-expect-error: TS can't detect thumb class for nextui custom styling */
        thumb: [
          "group-data-[pressed=true]:w-4",
          "group-data-[selected]:group-data-[pressed]:ml-2",
        ],
      },
    },
    {
      disableAnimation: false,
      size: "sm",
      class: {
        /** @ts-expect-error: TS can't detect thumb class for nextui custom styling */
        thumb: [
          "group-data-[pressed=true]:w-5",
          "group-data-[selected]:group-data-[pressed]:ml-3",
        ],
      },
    },
    {
      disableAnimation: false,
      size: "md",
      class: {
        /** @ts-expect-error: TS can't detect thumb class for nextui custom styling */
        thumb: [
          "group-data-[pressed=true]:w-6",
          "group-data-[selected]:group-data-[pressed]:ml-4",
        ],
      },
    },
    {
      disableAnimation: false,
      size: "lg",
      class: {
        /** @ts-expect-error: TS can't detect thumb class for nextui custom styling */
        thumb: [
          "group-data-[pressed=true]:w-7",
          "group-data-[selected]:group-data-[pressed]:ml-5",
        ],
      },
    },
  ],
});

const Switch = ({
  id,
  size,
  checked,
  showIcon,
  onChange,
  ...props
}: SwitchProps) => {
  return (
    <div className="flex w-8">
      <MySwitch
        id={`switch-${id}`}
        name={id}
        aria-labelledby={`switch_${id}`}
        onChange={onChange}
        size={size ?? "xs"}
        color="default"
        isSelected={checked}
        disableAnimation={false}
        thumbIcon={({ isSelected }) => {
          if (showIcon) {
            return isSelected ? <MoonIcon /> : <SunIcon />;
          }
        }}
        {...props}
        // classNames={{
        //   thumb:
        //     size === "xs" &&
        //     "z-0 group-data-[pressed=true]:w-4 group-data-[selected]:group-data-[pressed]:ml-2",
        // }}
      />
    </div>
  );
};
export default Switch;

// const SwitchPlayground = ({ id, checked, onChange }: SwitchProps) => {
//     const [scope, animate] = useAnimate();
//   const variants = {
//     checked: {
//       x: ["0.25rem", "1rem"],
//       right: "1.25rem",
//       left: "auto",
//       transition: { duration: 0.2, ease: "easeInOut" },
//     },
//     unchecked: {
//       x: ["1rem", "0.25rem"],
//       left: "0px",
//       right: "auto",
//       transition: { duration: 0.2, ease: "easeInOut" },
//     },
//   };

//   const handleMouseDown = async () => {
//     animate(`#ball_${id}`, { width: "1rem" });
//   };

//   const handleMouseUp = async () => {
//     animate(`#ball_${id}`, { width: "0.75rem" });
//   };

//   return (
//     <div className="flex w-8 justify-center">
//         <label ref={scope} htmlFor={id} className="group relative w-full">
//         <input
//           id={id}
//           className="invisible block duration-300 before:visible before:absolute before:-inset-1.5 before:left-0 before:my-auto before:h-5 before:w-8 before:cursor-pointer before:rounded-xl before:bg-gray-400 before:transition checked:before:bg-slate-900"
//           type="checkbox"
//           name="isOn"
//           checked={checked}
//           onChange={onChange}
//           onMouseDown={handleMouseDown}
//           onMouseUp={handleMouseUp}
//         />
//         <motion.div
//           id={`ball_${id}`}
//           whileTap={{
//             width: "1rem",
//           }}
//           style={{
//             left: `${!checked && "0px"}`,
//             right: `${checked && "1.25rem"}`,
//           }}
//           variants={variants}
//           animate={checked ? "checked" : "unchecked"}
//           className="absolute inset-y-0 my-auto h-3 w-3 cursor-pointer rounded-xl bg-white"
//         />
//       </label>
//     </div>
//   )
// };
