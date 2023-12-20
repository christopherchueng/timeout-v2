import Sidebar from "../_components/Sidebar";
import Clock from "../_components/Clock";

const Dashboard = () => {
  return (
    <main className="flex h-full w-full flex-row items-center justify-center">
      <Sidebar />
      <div className="hidden w-full text-7xl sm:flex sm:justify-center md:text-9xl">
        <Clock size="lg" />
      </div>
    </main>
  );
};

export default Dashboard;
