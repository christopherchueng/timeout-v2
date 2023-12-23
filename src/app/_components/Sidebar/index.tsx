"use client";

import { api } from "@/trpc/react";

import Alarmlist from "../Alarmlist";
import Loading from "./loading";

const Sidebar = () => {
  const { data: alarmlists, isLoading } = api.alarmlist.getAll.useQuery();

  if (isLoading) return <Loading />;

  return (
    <aside className="h-full w-full overflow-x-auto overflow-y-scroll border-r pt-16 sm:w-72 sm:flex-none">
      {!alarmlists && (
        <p className="flex h-full justify-center pt-10 text-xs italic text-gray-400">
          No Alarmlists!
        </p>
      )}
      {!!alarmlists &&
        alarmlists.map((alarmlist) => (
          <Alarmlist key={alarmlist.id} alarmlist={alarmlist} />
        ))}
    </aside>
  );
};

export default Sidebar;
