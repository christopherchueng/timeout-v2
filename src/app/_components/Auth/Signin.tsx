"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const GoogleIcon = () => (
  <svg
    fill="currentColor"
    viewBox="0 0 32 32"
    id="icon"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#ffffff"
    className="h-6 w-6"
  >
    <path d="M27.39,13.82H16.21v4.63h6.44c-.6,2.95-3.11,4.64-6.44,4.64a7.09,7.09,0,0,1,0-14.18,7,7,0,0,1,4.42,1.58L24.12,7a12,12,0,1,0-7.91,21c6,0,11.45-4.36,11.45-12A9.56,9.56,0,0,0,27.39,13.82Z" />
  </svg>
);

const Signin = () => {
  // If user typed in valid url (ex: /preferences), redirect user to callbackUrl after successful sign in
  // Otherwise, if clicking on sign in, direct user to dashboard
  const searchParams = useSearchParams();

  return (
    <button
      className="flex h-12 w-2/3 select-none items-center whitespace-nowrap rounded border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700 active:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      onClick={() =>
        signIn("google", {
          callbackUrl: searchParams.get("callbackUrl") ?? "/dashboard",
        })
      }
    >
      <GoogleIcon />
      <span className="w-full text-center">Sign in with Google</span>
    </button>
  );
};

export default Signin;
