import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Signin } from "../_components/Auth";
import { NameLogo } from "../_components/UI";

const SigninPage = async () => {
  const session = await getServerAuthSession();

  if (session) redirect("/dashboard");

  return (
    <div className="relative flex h-full flex-col items-center justify-center dark:bg-zinc-900">
      <div className="absolute top-40 flex flex-col items-center justify-center space-y-28">
        <NameLogo />
        <div className="flex h-44 w-96 flex-col items-center justify-center gap-4 rounded-lg border py-6 shadow-xl dark:border-zinc-700">
          <Signin />
          <p className="px-10 text-center text-xs italic text-gray-400">
            An account will be created for you during the sign-in process even
            if you don't have an existing account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
