"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

type ProviderWrapperProps = {
  children: ReactNode;
};

const ProviderWrapper = ({ children }: ProviderWrapperProps) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default ProviderWrapper;
