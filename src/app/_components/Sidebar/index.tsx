"use client";

import { api } from "@/trpc/react";
import { AnimatePresence, Reorder, motion } from "framer-motion";

import Alarmlist from "../Alarmlist";
import { Accordion } from "../Accordian";
import Loading from "./loading";
import { useDrawer } from "@/context/Drawer";
import { useEffect, useState } from "react";
import { AlarmlistWithAlarms } from "@/types";
import { redirect } from "next/navigation";
import { RouterOutputs } from "@/trpc/shared";
import { usePositionReorder } from "@/hooks/usePositionReorder";

type User = RouterOutputs["user"]["get"];

const Alarmlists = () => {
  const { data, isLoading } = api.alarmlist.getAllWithAlarms.useQuery();
  const {
    data: user,
    isLoading: loadingUser,
    isSuccess: userLoaded,
  } = api.user.get.useQuery();

  const [order, updatePosition, updateOrder] = usePositionReorder(
    user?.alarmlists,
  );

  const ctx = api.useUtils();

  const { mutate: reorderAlarmlists } =
    api.user.rearrangeAlarmlists.useMutation({
      onMutate: async ({ newOrder }) => {
        await ctx.alarmlist.getAllWithAlarms.cancel();

        const previousUserData = ctx.user.get.getData();

        ctx.user.get.setData(undefined, (user: User | undefined) => {
          if (!user) return;

          return {
            ...user,
            alarmlists: newOrder,
          };
        });

        return { previousUserData };
      },
      onSuccess: () => {
        void ctx.user.get.invalidate();
        // void ctx.alarmlist.getAllWithAlarms.invalidate();
      },
      onError: () => {
        console.log("Error happened");
      },
    });

  if (loadingUser) return <Loading />;

  if (!user) return;

  if (userLoaded && !user?.alarmlists?.length) {
    return (
      <p className="flex h-full justify-center pt-10 text-xs italic text-gray-400">
        No Alarmlists!
      </p>
    );
  }

  return (
    <Accordion>
      {user.alarmlists.map((alarmlist, index) => (
        <Alarmlist
          key={alarmlist.id}
          index={index}
          alarmlist={alarmlist}
          updateOrder={updateOrder}
          updatePosition={updatePosition}
        />
      ))}
    </Accordion>
  );
};

const Sidebar = () => {
  const { isDrawerOpen } = useDrawer();

  return (
    <>
      {/*
        Setting initial to false will keep sidebar open.
        Since initial width is set to 0, we will ignore.
     */}
      <AnimatePresence initial={false}>
        {isDrawerOpen && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{
              width: 300,
              transition: { duration: 0.2 },
            }}
            exit={{
              width: 0,
              transition: { duration: 0.2 },
            }}
            className="hidden h-full w-full overflow-x-auto overflow-y-scroll border-r pt-18 dark:border-r-zinc-600 sm:block sm:w-80 sm:flex-none"
          >
            <Alarmlists />
          </motion.aside>
        )}
      </AnimatePresence>
      <aside className="h-full w-full overflow-x-auto overflow-y-scroll border-r pt-18 dark:border-r-zinc-600 sm:hidden">
        <Alarmlists />
      </aside>
    </>
  );
};

export default Sidebar;
