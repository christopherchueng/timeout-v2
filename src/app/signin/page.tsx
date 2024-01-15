import { Signin } from "../_components/Auth";
import { NameLogo } from "../_components/UI";

const SigninPage = () => {
  return (
    <div className="relative flex h-full flex-col items-center justify-center pt-18">
      <div className="absolute top-40 text-5xl font-semibold tracking-tight">
        <NameLogo />
      </div>
      <div className="flex h-36 w-96 flex-col items-center justify-center gap-12 rounded-lg border py-6 shadow-xl">
        {/* <h1 className="text-2xl font-semibold">Sign in</h1>
        <hr className="w-64" /> */}
        <Signin />
      </div>
    </div>
  );
};

export default SigninPage;
