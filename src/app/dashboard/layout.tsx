import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

type DashboardLayout = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayout) => {
  return <>{children}</>;
};

export default DashboardLayout;
