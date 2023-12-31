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
  id: string;
  onChangeIndex: (id: string) => void;
};

type AccordianProps = {
  children: React.ReactElement[];
  defaultId?: string;
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
export const Accordion = ({ children, defaultId = "" }: AccordianProps) => {
  const [activeAlarmlists, setActiveAlarmlists] = useState([defaultId]);

  const onChangeIndex = (id: string) => {
    setActiveAlarmlists((currentActiveAlarmlists: string[]) => {
      if (currentActiveAlarmlists.includes(id)) {
        return currentActiveAlarmlists.filter((activeId) => activeId !== id);
      }

      return [...currentActiveAlarmlists, id];
    });
  };

  return Children.map(children, (child: React.ReactElement) => {
    const { key: id } = child;
    const isActive = !!child.key && activeAlarmlists.includes(child.key);

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
    <div {...rest} className="overflow-hidden rounded px-4">
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
