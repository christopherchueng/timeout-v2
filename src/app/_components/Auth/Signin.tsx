"use client";

import { signIn } from "next-auth/react";

const Signin = () => {
  return (
    <button
      className="text-xs"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      Sign in
    </button>
  );
};

export default Signin;
