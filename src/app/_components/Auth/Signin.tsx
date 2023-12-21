"use client";

import { signIn } from "next-auth/react";
import { Button } from "../UI";

const Signin = () => {
  return (
    <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
      Sign in
    </Button>
  );
};

export default Signin;
