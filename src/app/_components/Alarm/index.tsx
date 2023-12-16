"use client";

import { RouterOutputs } from "@/trpc/shared";
import clsx from "clsx";
import Switch from "../UI/Switch";
import { api } from "@/trpc/react";
import { Alarm } from "@prisma/client";
import { useState } from "react";

type ServerProps = RouterOutputs["alarm"]["getAllByAlarmlistId"][number];
type AlarmToggleFunction = {
  handleToggle: () => void;
};

type AlarmProps = ServerProps & AlarmToggleFunction;

const Alarm = (alarm: AlarmProps) => {
  const [isAlarmOn, setIsAlarmOn] = useState(alarm.isOn);
  const ctx = api.useUtils();

  const { mutate, isLoading: isToggling } = api.alarm.toggle.useMutation({
    onMutate: async ({ id, isOn }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarm.getAllByAlarmlistId.cancel();

      // Snapshot the previous value
      const previousAlarmlists = ctx.alarm.getAllByAlarmlistId.getData({
        alarmlistId: alarm.alarmlistId,
      });

      // Optimistically update to the new value
      ctx.alarm.getAllByAlarmlistId.setData(
        { alarmlistId: alarm.alarmlistId },
        (prev) => {
          if (!prev) return previousAlarmlists;

          const newAlarms = prev.map((alarm: Alarm) => {
            if (alarm.id === id) {
              return {
                ...alarm,
                isOn,
              };
            }

            return alarm;
          });

          return newAlarms;
        },
      );

      // Return a context object with the snapshotted value
      return { previousAlarmlists };
    },

    onSuccess: (_, { isOn }) => {
      setIsAlarmOn(isOn);
      void ctx.alarm.getAllByAlarmlistId.invalidate({
        alarmlistId: alarm.alarmlistId,
      });
    },

    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, isOn, context) => {
      // toast.error(
      //   `An error occured when marking todo as ${done ? "done" : "undone"}`,
      // );
      if (!context) return;
      ctx.alarm.getAllByAlarmlistId.setData(
        { alarmlistId: alarm.alarmlistId },
        () => context.previousAlarmlists,
      );
    },
    // Always refetch after error or success:
    onSettled: async () => {
      await ctx.alarm.getAllByAlarmlistId.invalidate({
        alarmlistId: alarm.alarmlistId,
      });
    },
  });
  return (
    <div className="flex flex-row justify-between rounded-xl border border-transparent px-2 py-0.5 transition duration-200 hover:bg-gray-200">
      <div
        className={clsx("flex flex-col transition", {
          "text-gray-400": !isAlarmOn || !alarm.isOn,
        })}
      >
        <div className="flex items-end gap-0.5 font-bold">
          <span className="leading-tight transition">
            {alarm.hour}:{alarm.minutes}
          </span>
          <span className="text-2xs">{alarm.meridiem}</span>
        </div>
        <div className="text-xs">{alarm.name}</div>
      </div>
      <Switch
        id={alarm.id}
        checked={isAlarmOn || alarm.isOn}
        onChange={(e) =>
          mutate({ id: alarm.id, isOn: e.currentTarget.checked })
        }
      />
    </div>
  );
};

export default Alarm;
