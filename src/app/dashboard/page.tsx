import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import Alarmlist from "../_components/Alarmlist";

const Dashboard = async () => {
  const session = await getServerAuthSession();

  if (!session) return null;

  const alarmlists = await api.alarmlist.getAlarmlistsByUserId.query({
    userId: session?.user.id,
  });

  return (
    <main className="flex h-full w-full flex-row items-center justify-center">
      <aside className="h-full w-full bg-red-200 pt-16 sm:w-72">
        {alarmlists.map((alarmlist) => (
          <Alarmlist {...alarmlist} key={alarmlist.id} />
        ))}
      </aside>
      <div className="hidden w-full text-9xl sm:block">12:30</div>
    </main>
  );
};

export default Dashboard;
