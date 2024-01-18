import Image from "next/image";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Cog, ExitIcon } from "../UI";
import Link from "next/link";

const ProfilePicture = ({ imageUrl }: { imageUrl: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeTab = () => {
      setIsMenuOpen(false);
    };

    document.addEventListener("click", closeTab);

    return () => {
      document.removeEventListener("click", closeTab);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex items-center">
      <button
        className="rounded-full border border-slate-900 dark:border-white/70"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <Image
          className="rounded-full"
          src={imageUrl}
          alt="Profile picture"
          height={28}
          width={28}
          priority={true}
        />
      </button>
      {isMenuOpen && (
        <div className="relative animate-dilate transition-all">
          <div className="absolute right-0 top-5 z-50 flex h-fit w-36 flex-col items-start rounded-md border bg-white p-2 shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            <Link
              href="/preferences"
              className="inline-flex w-full cursor-pointer gap-1.5 rounded-md p-2 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <Cog />
              <span>Preferences</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex w-full cursor-pointer gap-1.5 rounded-md p-2 text-start hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <ExitIcon />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
