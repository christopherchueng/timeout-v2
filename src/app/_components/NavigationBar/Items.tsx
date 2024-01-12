import { Signin, Signout } from "../Auth";
import CreateButton from "./CreateButton";
import { useSession } from "next-auth/react";
import Preferences from "./Preferences";

const Items = () => {
  const { data: session } = useSession();

  return (
    <div className="flex w-full select-none justify-end gap-2.5 sm:gap-4">
      {session && (
        <>
          <CreateButton />
          <div className="h-5 self-center border-l border-slate-900 text-slate-500" />
          <Preferences session={session} />
        </>
      )}
      {session ? <Signout /> : <Signin />}
    </div>
  );
};

export default Items;
