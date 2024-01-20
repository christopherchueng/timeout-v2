"use client";

import clsx from "clsx";
import { useDrawer } from "@/context/Drawer";
import { motion } from "framer-motion";

const HamburgerMenu = () => {
  const { isDrawerOpen, cycleDrawer } = useDrawer();

  return (
    <motion.button
      onTap={() => cycleDrawer()}
      className="hidden sm:flex sm:flex-col sm:items-center sm:justify-center"
    >
      <span
        className={clsx(
          isDrawerOpen ? "translate-y-1 rotate-45" : "-translate-y-0.5",
          "block h-0.5 w-6 rounded-sm bg-slate-900 transition-all duration-300 ease-out dark:bg-white/70",
        )}
      />
      <span
        className={clsx(
          isDrawerOpen ? "opacity-0" : "opacity-100",
          "my-0.5 block h-0.5 w-6 rounded-sm bg-slate-900 transition-all duration-300 ease-out dark:bg-white/70",
        )}
      />
      <span
        className={clsx(
          isDrawerOpen ? "-translate-y-1 -rotate-45" : "translate-y-0.5",
          "block h-0.5 w-6 rounded-sm bg-slate-900 transition-all duration-300 ease-out dark:bg-white/70",
        )}
      />
    </motion.button>
  );
};

export default HamburgerMenu;
