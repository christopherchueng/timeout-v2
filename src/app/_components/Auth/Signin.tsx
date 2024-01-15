"use client";

import { signIn } from "next-auth/react";
import { Button } from "../UI";
import { useSearchParams } from "next/navigation";

const Signin = () => {
  // If user typed in valid url (ex: /preferences), redirect user to callbackUrl after successful sign in
  // Otherwise, if clicking on sign in, direct user to dashboard
  const searchParams = useSearchParams();

  return (
    <Button
      onClick={() =>
        signIn("google", {
          callbackUrl: searchParams.get("callbackUrl") || "/dashboard",
        })
      }
    >
      Sign in
    </Button>
  );
};

export default Signin;
