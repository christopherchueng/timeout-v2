import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      Home
    </main>
  );
}
