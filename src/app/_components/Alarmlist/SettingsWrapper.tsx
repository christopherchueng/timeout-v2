import React, {
  useEffect,
  type ComponentPropsWithoutRef,
  forwardRef,
} from "react";
import Portal from "../Portal";

interface SettingsWrapperProps extends ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode;
  ref: HTMLInputElement | null;
  isOpen: boolean;
  cursorPosition: {
    x: number;
    y: number;
  };
  handleClose: ({ target }: MouseEvent) => void;
}

const SettingsWrapper = forwardRef<HTMLInputElement, SettingsWrapperProps>(
  (
    { children, isOpen, handleClose, cursorPosition }: SettingsWrapperProps,
    ref,
  ) => {
    useEffect(() => {
      const handleClickedOutside = (e: MouseEvent) => {
        handleClose(e);
      };

      document.addEventListener("click", handleClickedOutside);

      return () => {
        document.removeEventListener("click", handleClickedOutside);
      };
    }, [handleClose]);

    if (!isOpen) return null;

    return (
      <Portal wrapperId="Settings_Overlay">
        <div className="absolute inset-0 z-10 h-full w-full bg-transparent">
          <div
            ref={ref}
            style={{
              left: `${cursorPosition.x - 5}px`,
              top: `${cursorPosition.y + 10}px`,
            }}
            className="fixed left-0 z-20 rounded border bg-white"
          >
            {children}
          </div>
        </div>
      </Portal>
    );
  },
);

export default SettingsWrapper;
