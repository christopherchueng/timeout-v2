import React, { useEffect, type ComponentPropsWithoutRef } from "react";
import Portal from "../Portal";

interface ModalProps extends ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode;
  isOpen: boolean;
  handleClose: () => void;
}

const Modal = ({ children, isOpen, handleClose }: ModalProps) => {
  // Close modal on escape key press
  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) =>
      e.key === "Escape" ? handleClose() : null;
    document.body.addEventListener("keydown", closeOnEscapeKey);

    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, [handleClose]);

  // Disable scroll on modal load
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return (): void => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal wrapperId="portal-modal-ctn">
      <div className="fixed inset-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-hidden bg-transparent p-10 backdrop-blur-sm transition-all">
        <div className="relative flex h-56 w-72 items-center justify-center rounded border bg-white shadow-lg">
          <button onClick={handleClose} className="absolute right-5 top-0 py-3">
            &#x2715;
          </button>
          {children}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
