"use client";

import { RouterOutputs } from "@/trpc/shared";
import Alarm from "../Alarm";
import Switch from "../UI/Switch";
import { api } from "@/trpc/react";
import { useCallback, useState } from "react";
import type { Alarm as TAlarm } from "@prisma/client";
import clsx from "clsx";

type AlarmlistProps = RouterOutputs["alarmlist"]["getAll"][number];

const Alarmlist = (alarmlist: AlarmlistProps) => {
  const [toggleAlarmlist, setToggleAlarmlist] = useState(alarmlist.isOn);
  const [alarms, setAlarms] = useState<TAlarm[]>(alarmlist.alarms);

  const ctx = api.useUtils();

  const { mutate } = api.alarmlist.toggle.useMutation({
    onMutate: async ({ id, isOn }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarmlist.getAll.cancel();

      // Snapshot the previous value
      const previousAlarmlists = ctx.alarmlist.getAll.getData();

      // Optimistically update to the new value
      ctx.alarmlist.getAll.setData(undefined, (prev) => {
        if (!prev) return previousAlarmlists;

        const newAlarmlists = prev.map((alarmlist) => {
          if (alarmlist.id === id) {
            return {
              ...alarmlist,
              isOn,
            };
          }

          return alarmlist;
        });

        return newAlarmlists;
      });

      // Return a context object with the snapshotted value
      return { previousAlarmlists };
    },

    onSuccess: (err, { isOn }) => {
      setToggleAlarmlist(isOn);
      setAlarms((prev) => prev.map((alarm) => ({ ...alarm, isOn })));
    },

    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, isOn, context) => {
      // toast.error(
      //   `An error occured when marking todo as ${done ? "done" : "undone"}`,
      // );
      if (!context) return;
      ctx.alarmlist.getAll.setData(undefined, () => context.previousAlarmlists);
    },
    // Always refetch after error or success:
    onSettled: () => {
      void ctx.alarmlist.getAll.invalidate();
    },
  });

  const handleAlarmToggle = useCallback(() => {
    const updatedAlarms = alarms.map((alarm) => ({
      ...alarm,
      isOn: alarmlist.isOn,
    }));
    setAlarms(updatedAlarms);
  }, [alarmlist.isOn]);

  if (!alarms) return <div>No alarms</div>;

  return (
    <div className="px-4">
      <div className="flex justify-between rounded-xl border border-transparent px-2 py-0.5 text-lg transition duration-200 hover:bg-gray-200">
        <span
          className={clsx("self-center font-bold", {
            "text-gray-400": !alarmlist.isOn,
          })}
        >
          {alarmlist.name}
        </span>
        <Switch
          id={alarmlist.id}
          checked={toggleAlarmlist}
          onChange={(e) =>
            mutate({ id: alarmlist.id, isOn: e.currentTarget.checked })
          }
        />
      </div>
      {alarms.map((alarm) => (
        <Alarm {...alarm} key={alarm.id} handleToggle={handleAlarmToggle} />
      ))}
    </div>
  );
};

export default Alarmlist;
