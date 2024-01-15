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
        <a href="/signin">Sign in</a>
      )}
    </div>
  );
};

export default Items;
