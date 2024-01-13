import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preferences",
};

type layout = {
  children: React.ReactNode;
};

const layout = ({ children }: layout) => {
  return <>{children}</>;
};

export default layout;
