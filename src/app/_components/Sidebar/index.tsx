"use client";

import { api } from "@/trpc/react";
import { AnimatePresence, motion, useCycle } from "framer-motion";

import Alarmlist from "../Alarmlist";
import { Accordion } from "../Accordian";
import Loading from "./loading";
import { useDrawer } from "@/context/Drawer";

const Alarmlists = () => {
  const { data: alarmlists, isLoading } =
    api.alarmlist.getAllWithAlarms.useQuery();

  if (isLoading) return <Loading />;

  if (!alarmlists?.length) {
    return (
      <p className="flex h-full justify-center pt-10 text-xs italic text-gray-400">
        No Alarmlists!
      </p>
    );
  }

  return (
    <Accordion>
      {alarmlists.map((alarmlist) => (
        <Alarmlist key={alarmlist.id} alarmlist={alarmlist} />
      ))}
    </Accordion>
  );
};

const Sidebar = () => {
  const { isDrawerOpen } = useDrawer();

  return (
    <>
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{
              width: 300,
              transition: { duration: 0.2 },
            }}
            exit={{
              width: 0,
              transition: { duration: 0.2 },
            }}
            className="hidden h-full w-full overflow-x-auto overflow-y-scroll border-r pt-18 dark:border-r-zinc-600 sm:block sm:w-80 sm:flex-none"
          >
            <Alarmlists />
          </motion.aside>
        )}
      </AnimatePresence>
      <aside className="h-full w-full overflow-x-auto overflow-y-scroll border-r pt-18 dark:border-r-zinc-600 sm:hidden">
        <Alarmlists />
      </aside>
    </>
  );
};

export default Sidebar;
