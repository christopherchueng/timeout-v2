"use client";

import { Switch as SwitchComponent } from "@nextui-org/switch";
import { extendVariants } from "@nextui-org/system";

type SwitchProps = {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// @see links for customization:
// https://github.com/nextui-org/nextui/blob/main/packages/core/theme/src/components/toggle.ts
// https://nextui.org/docs/customization/custom-variants

export const MySwitch = extendVariants(SwitchComponent, {
  variants: {
    color: {
      default: {
        wrapper: [
          "bg-gray-300",
          "group-data-[selected=true]:bg-slate-900",
          "group-data-[selected=true]:text-primary-foreground",
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
    },
  },
  defaultVariants: {
    color: "default",
    disableAnimation: "false",
  },
});

const Switch = ({ id, checked, onChange }: SwitchProps) => {
  return (
    <div className="flex w-8">
      <MySwitch
        id={`switch-${id}`}
        name={id}
        aria-labelledby={`switch_${id}`}
        onChange={onChange}
        size="xs"
        color="default"
        isSelected={checked}
        disableAnimation={false}
        classNames={{
          thumb:
            "z-0 group-data-[pressed=true]:w-4 group-data-[selected]:group-data-[pressed]:ml-2",
        }}
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
