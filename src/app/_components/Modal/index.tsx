import {
  useEffect,
  type ComponentPropsWithoutRef,
  useRef,
  useState,
} from "react";
import Portal from "../Portal";
import { Tooltip } from "../UI";

interface ModalProps extends ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode;
  isOpen: boolean;
  handleClose: () => void;
}

const Modal = ({ children, isOpen, handleClose }: ModalProps) => {
  const modalRef = useRef<HTMLInputElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Close modal on escape key press or outside modal
  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) =>
      e.key === "Escape" ? handleClose() : null;

    const handleClickedOutside = (e: MouseEvent) => {
      if (modalRef?.current && !modalRef.current?.contains(e.target as Node)) {
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
    <Portal wrapperId="modal_overlay">
      <div
        id="modal"
        className="fixed inset-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-hidden bg-transparent p-10 backdrop-blur-sm transition-all"
      >
        <div
          ref={modalRef}
          className="relative box-border flex items-center justify-center rounded border bg-white p-8 shadow-lg"
          // className="relative box-border flex h-56 w-72 items-center justify-center rounded border bg-white p-8 shadow-lg"
        >
          <button
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleClose}
            className="absolute right-4 top-0 my-3 rounded-md border border-transparent px-1.5 outline-none transition hover:bg-gray-200"
          >
            <Tooltip text="Esc" isShowing={isHovering}>
              &#x2715;
            </Tooltip>
          </button>
          {children}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
