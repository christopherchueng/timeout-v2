"use client";

import { signIn } from "next-auth/react";

const Signin = () => {
  return (
    <button
      className="flex items-center whitespace-nowrap rounded-md border-slate-900 bg-slate-900 px-3 py-1.5 align-middle text-xs text-white transition hover:bg-slate-700 active:bg-slate-800"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      Sign in
    </button>
  );
};

export default Signin;
