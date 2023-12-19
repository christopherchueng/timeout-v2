import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { Signin, Signout } from "../Auth";
import Clock from "../Clock";

const NavigationBar = async () => {
  const session = await getServerAuthSession();

  return (
    <nav className="absolute z-10 flex w-full items-center justify-center bg-white px-8 py-4 text-xs">
      <div className="w-full">
        <Link href={session ? "/dashboard" : "/"}>Home</Link>
      </div>
      <div className="text-lg font-bold sm:hidden">
        <Clock size="sm" />
      </div>
      <div className="flex w-full justify-end gap-2">
        {session && (
          <>
            <Link href="/create">Create</Link>
            <span className="text-slate-500">&#124;</span>
          </>
        )}
        {session ? <Signout /> : <Signin />}
      </div>
    </nav>
  );
};

export default NavigationBar;
