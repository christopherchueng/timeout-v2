import {
  Children,
  HTMLAttributes,
  createContext,
  useContext,
  useState,
} from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";

type TAccordianContext = {
  isActive: boolean;
  index: number;
  onChangeIndex: (index: number) => void;
};

type AccordianProps = {
  children: React.ReactNode;
  defaultIndex?: number;
};
const AccordionContext = createContext<TAccordianContext | null>(null);
const useAccordion = () => {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error("useTimeContext must be used within a TimeContextProvider");
  }

  return context;
};

// Parent wrapper
export const Accordion = ({ children, defaultIndex = -1 }: AccordianProps) => {
  const [activeIndex, setActiveIndex] = useState([defaultIndex]);

  function onChangeIndex(index: number) {
    setActiveIndex((currentActiveIndex: number[]) => {
      if (currentActiveIndex.includes(index)) {
        return currentActiveIndex.filter((i) => i !== index);
      }

      return currentActiveIndex.concat(index);
    });
  }

  return Children.map(children, (child, index) => {
    const isActive = Array.isArray(activeIndex)
      ? activeIndex.includes(index)
      : activeIndex === index;

    return (
      <AccordionContext.Provider value={{ isActive, index, onChangeIndex }}>
        {child}
      </AccordionContext.Provider>
    );
  });
};

interface TAccordionItem extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
// Each alarmlist
export const AccordionItem = ({ children, ...rest }: TAccordionItem) => {
  return (
    <div {...rest} className="overflow-hidden rounded px-4">
      {children}
    </div>
  );
};

interface TAccordionHeader extends HTMLMotionProps<"li"> {
  children: React.ReactNode;
  isSettingsTabOpen: boolean;
  handleToggleAccordion: (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
  ) => boolean;
}

// Alarmlist header/tab
export const AccordionHeader = ({
  children,
  isSettingsTabOpen,
  handleToggleAccordion,
  ...rest
}: TAccordionHeader) => {
  const { index, onChangeIndex } = useAccordion();

  return (
    <motion.li
      {...rest}
      onClick={(e) => {
        if (handleToggleAccordion(e)) {
          onChangeIndex(index);
        }
      }}
    >
      {children}
    </motion.li>
  );
};

// Alarms
export const AccordionPanel = ({ children }: { children: React.ReactNode }) => {
  const { isActive } = useAccordion();

  return (
    <AnimatePresence initial={false}>
      {isActive && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
        >
          <div className="AccordionPanel">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
