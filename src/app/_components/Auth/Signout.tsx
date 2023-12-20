"use client";

import { signOut } from "next-auth/react";

const Signout = () => {
  return (
    <button
      className="flex items-center whitespace-nowrap rounded-md border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700 active:bg-slate-800"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
};

export default Signout;
