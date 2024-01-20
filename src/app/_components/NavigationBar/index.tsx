"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Items from "./Items";
import { HamburgerMenu, Logo, NameLogo } from "../UI";
import { usePathname } from "next/navigation";

const NavigationBar = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <nav className="absolute z-10 flex w-full items-center justify-center px-6 py-4 text-xs sm:px-8">
      <div className="w-full">
        <div className="flex gap-4">
          {session && pathname === "/dashboard" && <HamburgerMenu />}
          <div className="hidden w-fit sm:block">
            <Link href={status === "authenticated" ? "/dashboard" : "/"}>
              <NameLogo className="h-8 w-24" />
            </Link>
          </div>
          <div className="w-fit sm:hidden">
            <Link href={status === "authenticated" ? "/dashboard" : "/"}>
              <Logo className="h-7 w-7" />
            </Link>
          </div>
        </div>
      </div>
      <Items />
    </nav>
  );
};

export default NavigationBar;
