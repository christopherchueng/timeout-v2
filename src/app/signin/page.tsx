import { Signin } from "../_components/Auth";
import { NameLogo } from "../_components/UI";

const SigninPage = () => {
  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <div className="absolute top-40 flex flex-col items-center justify-center space-y-28">
        <NameLogo />
        <div className="flex h-36 w-96 items-center justify-center rounded-lg border py-6 shadow-xl">
          <Signin />
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
