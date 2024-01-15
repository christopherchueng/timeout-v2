"use client";

import Link from "next/link";
import Mode from "./Mode";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const PreferencesPage = () => {
  // onUnauthenticated sends user to sign in page,
  // and if successful, they will be redirected to preferences
  // ...although the callbackUrl in nextauth's Signin API seems to handle this...
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin?callbackUrl=/preferences");
    },
  });

  if (status === "loading") return <></>;

  if (!session) return;

  return (
    <main className="relative flex h-full w-full justify-center px-6 text-slate-900 sm:px-0">
      <div className="absolute top-16 flex max-w-2xl flex-col items-center gap-10 px-6 pt-6">
        <div className="w-full underline underline-offset-2">
          <Link href="/dashboard" className="text-xs">
            Back to dashboard
          </Link>
        </div>
        <div className="w-full">
          <h1 className="text-xl font-bold">Preferences</h1>
        </div>
        <div className="flex w-full flex-row items-center justify-between gap-4">
          <div className="leading-8">
            <span className="text-sm font-semibold">Standard time</span>
            <p className="min-w-8 max-w-prose text-xs text-gray-400">
              Display time in 12-hour format. Turn off to switch to military
              time (24-hour format).
            </p>
          </div>
          <Mode session={session} />
        </div>
      </div>
    </main>
  );
};

export default PreferencesPage;
