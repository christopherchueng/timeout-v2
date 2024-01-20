"use client";

import React, { createContext, useContext } from "react";
import { useCycle, type Cycle } from "framer-motion";

type DrawerProviderProps = {
  children: React.ReactNode;
};

type DrawerContextType = {
  isDrawerOpen: boolean;
  cycleDrawer: Cycle;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);

  if (context === null) {
    throw new Error("useDrawer must be used within a DrawerContextProvider");
  }

  return context;
};

const DrawerProvider = ({ children }: DrawerProviderProps) => {
  const [isDrawerOpen, cycleDrawer] = useCycle(true, false);

  return (
    <DrawerContext.Provider value={{ isDrawerOpen, cycleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export default DrawerProvider;
