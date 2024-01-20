import clsx from "clsx";
import { useDrawer } from "@/context/Drawer";

const HamburgerMenu = () => {
  const { isDrawerOpen, toggleDrawer } = useDrawer();

  return (
    <button
      onClick={toggleDrawer}
      className="hidden sm:flex sm:flex-col sm:items-center sm:justify-center"
    >
      <span
        className={clsx(
          isDrawerOpen ? "translate-y-1 rotate-45" : "-translate-y-0.5",
          "block h-0.5 w-6 rounded-sm bg-slate-900 transition-all duration-300 ease-out dark:bg-white/70",
        )}
      />
      <span
        className={clsx(
          isDrawerOpen ? "opacity-0" : "opacity-100",
          "my-0.5 block h-0.5 w-6 rounded-sm bg-slate-900 transition-all duration-300 ease-out dark:bg-white/70",
        )}
      />
      <span
        className={clsx(
          isDrawerOpen ? "-translate-y-1 -rotate-45" : "translate-y-0.5",
          "block h-0.5 w-6 rounded-sm bg-slate-900 transition-all duration-300 ease-out dark:bg-white/70",
        )}
      />
    </button>
  );
};

export default HamburgerMenu;
