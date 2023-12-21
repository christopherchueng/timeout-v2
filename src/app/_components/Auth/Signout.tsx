"use client";

import { signOut } from "next-auth/react";
import { Button } from "../UI";

const Signout = () => {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
  );
};

export default Signout;
