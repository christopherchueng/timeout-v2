"use client";

import { createContext, useContext } from "react";
import { api } from "@/trpc/react";
import type { Preference } from "@prisma/client";
import { signIn, useSession } from "next-auth/react";
import { Signin } from "@/app/_components/Auth";

type PreferencesContextType = {
  preferences: Preference;
};

export const PreferencesContext = createContext<PreferencesContextType | null>(
  null,
);

export const usePreferencesContext = () => {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferencesContext must be used within a PreferencesContextProvider",
    );
  }

  return context;
};

type PreferencesProps = {
  children: React.ReactNode;
};

const PreferencesProvider = ({ children }: PreferencesProps) => {
  // const { data: session, status } = useSession();

  // if (status !== "unauthenticated") {
  //   return <Signin />;
  // }

  const { data: preferences } = api.preference.get.useQuery();

  if (!preferences) return;

  return (
    <PreferencesContext.Provider value={{ preferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export default PreferencesProvider;
