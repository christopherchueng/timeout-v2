import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";
import ModeSwitch from "./ModeSwitch";
import ThemeSwitch from "./ThemeSwitch";

const PreferencesPage = async () => {
  const session = await getServerAuthSession();

  if (!session) return;

  return (
    <main className="relative flex h-full w-full justify-center px-6 text-slate-900 transition dark:bg-zinc-900 dark:text-white/80 sm:px-0">
      <div className="absolute top-16 flex max-w-2xl flex-col items-center gap-10 px-6 pt-6">
        <div className="w-full underline underline-offset-2">
          <Link
            href="/dashboard"
            className="text-xs text-slate-900 transition hover:opacity-70 dark:text-white/70"
          >
            Back to dashboard
          </Link>
        </div>
        <div className="w-full">
          <h1 className="text-xl font-bold">Preferences</h1>
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-8">
          <div className="flex flex-col gap-1.5">
            <div className="flex w-full justify-between leading-8">
              <span className="text-sm font-semibold">Standard time</span>
              <ModeSwitch session={session} />
            </div>
            <p className="min-w-8 max-w-prose text-xs text-gray-400">
              Display time in 12-hour format. Turn off to switch to military
              time (24-hour format).
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex w-full justify-between leading-8">
              <span className="text-sm font-semibold">Dark mode</span>
              <ThemeSwitch />
            </div>
            <p className="min-w-8 max-w-prose text-xs text-gray-400">
              Allergic to the sun? SPF should help... or you could stay in the
              shade in dark mode.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PreferencesPage;
