"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

type ProviderWrapperProps = {
  children: ReactNode;
};

const ProviderWrapper = async ({ children }: ProviderWrapperProps) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default ProviderWrapper;
