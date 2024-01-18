import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";
import Mode from "./Mode";

const PreferencesPage = async () => {
  const session = await getServerAuthSession();

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
        <div className="flex w-full flex-col items-center justify-between gap-1.5">
          <div className="flex w-full justify-between leading-8">
            <span className="text-sm font-semibold">Standard time</span>
            <Mode session={session} />
          </div>
          <p className="min-w-8 max-w-prose text-xs text-gray-400">
            Display time in 12-hour format. Turn off to switch to military time
            (24-hour format).
          </p>
        </div>
      </div>
    </main>
  );
};

export default PreferencesPage;
