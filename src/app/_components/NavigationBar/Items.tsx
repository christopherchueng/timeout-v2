import Link from "next/link";
import { useSession } from "next-auth/react";
import CreateButton from "./CreateButton";
import ProfilePicture from "./ProfilePicture";

const Loading = () => (
  <div className="h-6 w-16 animate-pulse rounded bg-gray-200 px-3 py-1.5 transition dark:bg-zinc-700" />
);

const Items = () => {
  const { data: session, status } = useSession();

  const rightItem = () => {
    if (!session && status === "loading") return <Loading />;

    if (session && status === "authenticated") {
      return (
        <>
          <CreateButton />
          <div className="h-5 self-center border-l border-slate-900 text-slate-500 dark:border-zinc-600/70" />
          <ProfilePicture imageUrl={session.user.image!} />
        </>
      );
    }

    return (
      <Link
        className="flex select-none items-center justify-center whitespace-nowrap rounded border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700 active:bg-slate-800 disabled:cursor-not-allowed dark:border-white/80 dark:bg-white/80 dark:text-slate-900 dark:hover:border-white dark:hover:bg-white dark:active:border-white/80 dark:active:bg-white/80"
        href="/signin"
      >
        Sign in
      </Link>
    );
  };

  return (
    <div className="flex w-full select-none justify-end gap-6 sm:gap-5">
      {rightItem()}
    </div>
  );
};

export default Items;
