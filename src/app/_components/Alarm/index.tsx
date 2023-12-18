"use client";

import { RouterOutputs } from "@/trpc/shared";
import clsx from "clsx";
import Switch from "../UI/Switch";
import { api } from "@/trpc/react";
import { Alarm, Alarmlist } from "@prisma/client";

type TAlarm = RouterOutputs["alarm"]["getAllByAlarmlistId"][number];

type AlarmToggleFunction = {
  isAlarmlistOn: boolean;
  handleAlarmlistToggle: (
    updatedAlarmlist: Alarmlist,
    updatedAlarms: Alarm[],
    isOn: boolean,
  ) => void;
};

type AlarmProps = TAlarm & AlarmToggleFunction;

const Alarm = (alarm: AlarmProps) => {
  const { handleAlarmlistToggle } = alarm;

  const ctx = api.useUtils();

  const { mutate } = api.alarm.toggle.useMutation({
    onMutate: async ({ id, isOn }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarm.getAllByAlarmlistId.cancel();

      // Snapshot the previous value
      const previousAlarms = ctx.alarm.getAllByAlarmlistId.getData({
        alarmlistId: alarm.alarmlistId,
      });

      // Optimistically update to the new value
      ctx.alarm.getAllByAlarmlistId.setData(
        { alarmlistId: alarm.alarmlistId },
        (prev) => {
          if (!prev) return previousAlarms;

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
      return { previousAlarms };
    },

    onSuccess: async (data) => {
      handleAlarmlistToggle(data.alarmlist, data.alarms, data.alarmlist.isOn);
      void ctx.alarm.getAllByAlarmlistId.invalidate({
        alarmlistId: data.alarmlist.id,
      });
    },

    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_err, _isOn, context) => {
      // toast.error(
      //   `An error occured when marking todo as ${done ? "done" : "undone"}`,
      // );
      if (!context) return;
      ctx.alarm.getAllByAlarmlistId.setData(
        { alarmlistId: alarm.alarmlistId },
        () => context.previousAlarms,
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
          "text-gray-400": !alarm.isOn,
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
        checked={alarm.isOn}
        onChange={(e) => {
          mutate({ id: alarm.id, isOn: e.currentTarget.checked });
        }}
      />
    </div>
  );
};

export default Alarm;
