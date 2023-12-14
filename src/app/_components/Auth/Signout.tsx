"use client";

import { signOut } from "next-auth/react";

const Signout = () => {
  return (
    <button className="text-xs" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
};

export default Signout;
