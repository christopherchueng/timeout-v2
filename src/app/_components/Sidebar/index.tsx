"use client";

import { api } from "@/trpc/react";

import Alarmlist from "../Alarmlist";

const Sidebar = () => {
  const { data: alarmlists } = api.alarmlist.getAll.useQuery();

  if (!alarmlists) return <p>No alarmlists!</p>;

  return (
    <aside className="h-full w-full pt-16 sm:w-72 sm:flex-none">
      {alarmlists.map((alarmlist) => (
        <Alarmlist key={alarmlist.id} alarmlist={alarmlist} />
      ))}
    </aside>
  );
};

export default Sidebar;
