import { Signin } from "../Auth";
import CreateButton from "./CreateButton";
import { useSession } from "next-auth/react";
import ProfilePicture from "./ProfilePicture";

const Items = () => {
  const { data: session } = useSession();

  return (
    <div className="flex w-full select-none justify-end gap-5 sm:gap-4">
      {session && (
        <>
          <CreateButton />
          <div className="h-5 self-center border-l border-slate-900 text-slate-500" />
        </>
      )}
      {session ? (
        <ProfilePicture imageUrl={session.user.image!} />
      ) : (
        <a
          className="flex select-none items-center justify-center whitespace-nowrap rounded border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700 active:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          href="/signin"
        >
          Sign in
        </a>
      )}
    </div>
  );
};

export default Items;
