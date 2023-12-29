"use client";

import { api } from "@/trpc/react";

import Alarmlist from "../Alarmlist";
import Loading from "./loading";

const Alarmlists = () => {
  const { data: alarmlists, isLoading } =
    api.alarmlist.getAllWithAlarms.useQuery();
  if (isLoading) return <Loading />;

  if (!alarmlists)
    return (
      <p className="flex h-full justify-center pt-10 text-xs italic text-gray-400">
        No Alarmlists!
      </p>
    );

  return (
    <ul className="px-4">
      {alarmlists.map((alarmlist) => (
        <Alarmlist key={alarmlist.id} alarmlist={alarmlist} />
      ))}
    </ul>
  );
};

const Sidebar = () => {
  api.alarmlist.getAllWithAlarms.useQuery();

  return (
    <aside className="h-full w-full overflow-x-auto overflow-y-scroll border-r pt-16 sm:w-72 sm:flex-none">
      <Alarmlists />
    </aside>
  );
};

export default Sidebar;
