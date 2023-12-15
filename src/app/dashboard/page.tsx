import Sidebar from "../_components/Sidebar";

const Dashboard = () => {
  return (
    <main className="flex h-full w-full flex-row items-center justify-center">
      <Sidebar />
      <div className="hidden w-full text-center text-9xl sm:block">12:30</div>
    </main>
  );
};

export default Dashboard;
