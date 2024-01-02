import { getServerAuthSession } from "@/server/auth";
import CreateButton from "./CreateButton";
import { Signin, Signout } from "../Auth";

const Items = async () => {
  const session = await getServerAuthSession();

  return (
    <div className="flex w-full justify-end gap-2.5 sm:gap-4">
      {session && (
        <>
          <CreateButton />
          <div className="h-5 self-center border-l border-slate-900 text-slate-500" />
        </>
      )}
      {session ? <Signout /> : <Signin />}
    </div>
  );
};

export default Items;