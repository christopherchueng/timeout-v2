import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { Signin, Signout } from "../Auth";
import Clock from "../Clock";

const Logo = async () => {
  const session = await getServerAuthSession();

  return (
    <div className="w-full">
      <Link href={session ? "/dashboard" : "/"}>Home</Link>
    </div>
  );
};

const Items = async () => {
  const session = await getServerAuthSession();

  return (
    <div className="flex w-full justify-end gap-2">
      {session && (
        <>
          <Link href="/create">Create</Link>
          <span className="text-slate-500">&#124;</span>
        </>
      )}
      {session ? <Signout /> : <Signin />}
    </div>
  );
};

const NavigationBar = () => {
  return (
    <nav className="absolute z-10 flex w-full items-center justify-center bg-white px-8 py-4 text-xs">
      <Logo />
      <div className="text-lg font-bold sm:hidden">
        <Clock size="sm" />
      </div>
      <Items />
    </nav>
  );
};

export default NavigationBar;
