import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";

import Alarmlist from "../Alarmlist";

const Sidebar = async () => {
  const session = await getServerAuthSession();

  if (!session) return null;

  const alarmlists = await api.alarmlist.getAll.query();
  return (
    <aside className="h-full w-full pt-16 sm:w-72">
      {alarmlists.map((alarmlist) => (
        <Alarmlist key={alarmlist.id} alarmlist={alarmlist} />
      ))}
    </aside>
  );
};

export default Sidebar;
