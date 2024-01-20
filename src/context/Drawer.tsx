"use client";

import React, { useState, createContext, useContext } from "react";

type DrawerProviderProps = {
  children: React.ReactNode;
};

type DrawerContextType = {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  return (
    <DrawerContext.Provider value={{ isDrawerOpen, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export default DrawerProvider;
