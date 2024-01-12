"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Items from "./Items";

const Logo = () => {
  const { data: session } = useSession();

  return (
    <div className="w-full">
      <Link href={session ? "/dashboard" : "/"}>Home</Link>
    </div>
  );
};

const NavigationBar = () => {
  return (
    <nav className="absolute z-10 flex w-full items-center justify-center bg-white px-6 py-4 text-xs sm:px-8">
      <Logo />
      <Items />
    </nav>
  );
};

export default NavigationBar;
