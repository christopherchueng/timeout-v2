import { Children, createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

export const Accordion = ({ children, defaultIndex = 0 }: AccordianProps) => {
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

export const AccordionItem = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-8 overflow-hidden rounded">{children}</div>;
};

export const AccordionHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isActive, index, onChangeIndex } = useAccordion();

  return (
    <motion.div
      className={`AccordionHeader ${isActive ? "active" : ""}`}
      onClick={() => onChangeIndex(index)}
    >
      {children}
    </motion.div>
  );
};

const AccordionPanel = ({ children }: { children: React.ReactNode }) => {
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

// export default function App() {
//   return (
//     <section className="App">
//       <Accordion>
//         {[...Array(2)].map((_, i) => (
//           <AccordionItem key={i}>
//             <AccordionHeader>Accordion</AccordionHeader>
//             <AccordionPanel>
//               Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos quod
//               explicabo, nam sapiente id nostrum ex, ab numquam, doloremque
//               aspernatur quisquam illo! Officiis explicabo laborum incidunt
//               corrupti provident esse eligendi.
//             </AccordionPanel>
//           </AccordionItem>
//         ))}
//       </Accordion>
//     </section>
//   );
// }
