"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Items from "./Items";

const NavigationBar = () => {
  const { status } = useSession();

  if (status === "loading") return;

  return (
    <nav className="absolute z-10 flex w-full items-center justify-center bg-white px-6 py-4 text-xs sm:px-8">
      <div className="w-full">
        <Link href={status === "authenticated" ? "/dashboard" : "/"}>Home</Link>
      </div>
      <Items />
    </nav>
  );
};

export default NavigationBar;
