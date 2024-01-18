import { useEffect, type ComponentPropsWithoutRef, forwardRef } from "react";
import Portal from "../Portal";

interface SettingsWrapperProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  ref: HTMLDivElement | null;
  isOpen: boolean;
  cursorPosition: {
    x: number;
    y: number;
  };
  handleClose: (e: MouseEvent) => void;
}

const SettingsWrapper = forwardRef<HTMLDivElement, SettingsWrapperProps>(
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
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
            }}
            className="fixed left-0 z-20 rounded border bg-white dark:border-zinc-600 dark:bg-zinc-900"
          >
            {children}
          </div>
        </div>
      </Portal>
    );
  },
);

export default SettingsWrapper;
