import React, { useEffect, type ComponentPropsWithoutRef, useRef } from "react";
import Portal from "../Portal";

interface ModalProps extends ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode;
  isOpen: boolean;
  handleClose: () => void;
}

const Modal = ({ children, isOpen, handleClose }: ModalProps) => {
  const modalRef = useRef<HTMLInputElement | null>(null);

  // Close modal on escape key press or outside modal
  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) =>
      e.key === "Escape" ? handleClose() : null;

    const handleClickedOutside = ({ target }: MouseEvent) => {
      if (modalRef?.current && !modalRef.current?.contains(target as Node)) {
        handleClose();
      }
    };

    document.body.addEventListener("keydown", closeOnEscapeKey);
    document.addEventListener("click", handleClickedOutside);

    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
      document.removeEventListener("click", handleClickedOutside);
    };
  }, [handleClose]);

  // Disable scroll on modal load
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal wrapperId="portal-modal-ctn">
      <div className="fixed inset-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-hidden bg-transparent p-10 backdrop-blur-sm transition-all">
        <div
          ref={modalRef}
          className="relative box-border flex h-56 w-72 items-center justify-center rounded border bg-white p-8 shadow-lg"
        >
          <button
            onClick={handleClose}
            className="absolute right-5 top-0 my-3 outline-none"
          >
            &#x2715;
          </button>
          {children}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
