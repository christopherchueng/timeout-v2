"use client";

import { api } from "@/trpc/react";

import Alarmlist from "../Alarmlist";
import { Accordion } from "../Accordian";
import Loading from "./loading";

const Alarmlists = () => {
  const { data: alarmlists, isLoading } =
    api.alarmlist.getAllWithAlarms.useQuery();

  if (isLoading) return <Loading />;

  if (!alarmlists?.length) {
    return (
      <p className="flex h-full justify-center pt-10 text-xs italic text-gray-400">
        No Alarmlists!
      </p>
    );
  }

  return (
    <Accordion>
      {alarmlists.map((alarmlist) => (
        <Alarmlist key={alarmlist.id} alarmlist={alarmlist} />
      ))}
    </Accordion>
  );
};

const Sidebar = () => {
  return (
    <aside className="h-full w-full overflow-x-auto overflow-y-scroll border-r pt-18 sm:w-80 sm:flex-none">
      <Alarmlists />
    </aside>
  );
};

export default Sidebar;
