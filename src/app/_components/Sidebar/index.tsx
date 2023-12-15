import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";

import Alarmlist from "../Alarmlist";

const Sidebar = async () => {
  const session = await getServerAuthSession();

  if (!session) return null;

  const alarmlists = await api.alarmlist.getAlarmlistsByUserId.query({
    userId: session?.user.id,
  });
  return (
    <aside className="h-full w-full pt-16 sm:w-72">
      {alarmlists.map((alarmlist) => (
        <Alarmlist {...alarmlist} key={alarmlist.id} />
      ))}
    </aside>
  );
};

export default Sidebar;
