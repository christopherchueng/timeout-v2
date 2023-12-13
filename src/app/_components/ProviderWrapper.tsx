"use client";

import { ReactNode } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

type ProviderWrapperProps = {
  children: ReactNode;
};

const ProviderWrapper = ({ children }: ProviderWrapperProps) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default ProviderWrapper;
