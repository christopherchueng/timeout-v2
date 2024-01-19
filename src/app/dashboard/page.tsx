"use client";

import Sidebar from "../_components/Sidebar";
import Clock from "../_components/Clock";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const Dashboard = () => {
  // onUnauthenticated sends user to sign in page,
  // and if successful, they will be redirected to the dashboard
  // ...although the callbackUrl in nextauth's Signin API seems to handle this...
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin?callbackUrl=/dashboard");
    },
  });

  if (status === "loading") return <></>;

  return (
    <main className="flex h-full w-full flex-row items-center justify-center dark:bg-zinc-900">
      <Sidebar />
      <div className="z-0 hidden h-full w-full items-center text-5xl dark:bg-zinc-900 sm:flex sm:justify-center md:text-7xl lg:text-9xl">
        <Clock size="lg" />
      </div>
    </main>
  );
};

export default Dashboard;
