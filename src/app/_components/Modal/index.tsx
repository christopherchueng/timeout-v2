import React, { useEffect } from "react";
import Portal from "../Portal";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  handleClose: () => void;
};

const Modal = ({ children, isOpen, handleClose }: ModalProps) => {
  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) =>
      e.key === "Escape" ? handleClose() : null;
    document.body.addEventListener("keydown", closeOnEscapeKey);

    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <Portal wrapperId="portal-modal-ctn">
      <div className="modal">
        <button onClick={handleClose} className="close-btn">
          Close
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </Portal>
  );
};

export default Modal;
