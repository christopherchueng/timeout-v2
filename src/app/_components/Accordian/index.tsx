import {
  Children,
  type HTMLAttributes,
  createContext,
  useContext,
  useState,
} from "react";
import { AnimatePresence, type HTMLMotionProps, motion } from "framer-motion";

type TAccordionContext = {
  isActive: boolean;
  id: string;
  onChangeIndex: (id: string) => void;
};

type AccordionProps = {
  children: React.ReactElement[];
  defaultId?: string;
};
const AccordionContext = createContext<TAccordionContext | null>(null);
const useAccordion = () => {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error("useTimeContext must be used within a TimeContextProvider");
  }

  return context;
};

// Parent wrapper
export const Accordion = ({ children, defaultId = "" }: AccordionProps) => {
  const [activeAlarmlistIds, setActiveAlarmlistIds] = useState([defaultId]);

  const onChangeIndex = (id: string) => {
    setActiveAlarmlistIds((currentActiveAlarmlistIds: string[]) => {
      if (currentActiveAlarmlistIds.includes(id)) {
        return currentActiveAlarmlistIds.filter((activeId) => activeId !== id);
      }

      return [...currentActiveAlarmlistIds, id];
    });
  };

  return Children.map(children, (child: React.ReactElement) => {
    const { key: id } = child;
    const isActive = !!child.key && activeAlarmlistIds.includes(child.key);

    if (!id) return;

    return (
      <AccordionContext.Provider value={{ isActive, id, onChangeIndex }}>
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
    <div {...rest} className="mt-0.5 overflow-hidden rounded px-4 first:mt-0">
      {children}
    </div>
  );
};

interface TAccordionHeader extends HTMLMotionProps<"li"> {
  children: React.ReactNode;
  handleToggleAccordion: (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
  ) => boolean;
}

// Alarmlist header/tab
export const AccordionHeader = ({
  children,
  handleToggleAccordion,
  ...rest
}: TAccordionHeader) => {
  const { id, onChangeIndex } = useAccordion();

  return (
    <motion.li
      {...rest}
      onClick={(e) => {
        if (handleToggleAccordion(e)) {
          onChangeIndex(id);
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
