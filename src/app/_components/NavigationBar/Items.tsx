import CreateButton from "./CreateButton";
import { useSession } from "next-auth/react";
import ProfilePicture from "./ProfilePicture";

const Loading = () => (
  <div className="h-6 w-16 animate-pulse rounded bg-gray-200 px-3 py-1.5 transition dark:bg-zinc-700" />
);

const Items = () => {
  const { data: session, status } = useSession();

  const rightItem = () => {
    if (status === "loading") return <Loading />;

    if (status === "authenticated")
      return <ProfilePicture imageUrl={session.user.image!} />;

    return (
      <a
        className="flex select-none items-center justify-center whitespace-nowrap rounded border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700 active:bg-slate-800 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-white/70 dark:hover:bg-slate-700/70 dark:active:bg-slate-700/40"
        href="/signin"
      >
        Sign in
      </a>
    );
  };

  return (
    <div className="flex w-full select-none justify-end gap-6 sm:gap-5">
      {session && (
        <>
          <CreateButton />
          <div className="h-5 self-center border-l border-slate-900 text-slate-500 dark:border-zinc-600/70" />
        </>
      )}
      {rightItem()}
    </div>
  );
};

export default Items;
