import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { Signin, Signout } from "../Auth";

const NavigationBar = async () => {
  const session = await getServerAuthSession();

  return (
    <nav className="mx-8 my-4 flex justify-between text-xs">
      <Link href={session ? "/dashboard" : "/"}>Home</Link>
      <div className="flex gap-2">
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
