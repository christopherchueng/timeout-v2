"use client";

import clsx from "clsx";
import { Switch } from "../UI";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import AlarmIcon from "../UI/AlarmIcon";
// import Ellipsis from "../UI/Ellipsis";

type Alarm = RouterOutputs["alarm"]["getAllByAlarmlistId"][number];

type AlarmProps = {
  alarm: Alarm;
  handleAlarmlistToggle: (updatedAlarms: Alarm[], isOn: boolean) => void;
};

const Alarm = ({ alarm, handleAlarmlistToggle }: AlarmProps) => {
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
      handleAlarmlistToggle(data.alarms, data.alarmlist.isOn);
    },

    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_err, _isOn, context) => {
      if (!context) return;
      ctx.alarm.getAllByAlarmlistId.setData(
        { alarmlistId: alarm.alarmlistId },
        () => context.previousAlarms,
      );
    },
    // Always refetch after error or success:
    onSettled: () => {
      void ctx.alarm.getAllByAlarmlistId.invalidate({
        alarmlistId: alarm.alarmlistId,
      });
    },
  });

  return (
    <li className="group relative flex h-10 flex-row items-center justify-between rounded-lg border border-transparent py-1 pl-4 pr-2 transition duration-200 hover:bg-gray-200">
      <div className="absolute flex w-3/4 items-center gap-2 group-hover:w-[73%]">
        <AlarmIcon isOn={alarm.isOn} />
        <div
          className={clsx("flex flex-col transition", {
            "text-gray-400": !alarm.isOn,
          })}
        >
          <div className="flex items-end gap-0.5 text-sm font-semibold">
            <span className="leading-tight">
              {alarm.hour}:{alarm.minutes}
            </span>
            <span className="text-2xs">{alarm.meridiem}</span>
          </div>
          <div className="text-xs">{alarm.name}</div>
        </div>
      </div>
      <div className="absolute right-1 inline-flex w-auto gap-1.5">
        {/* <div className="relative">
            <Ellipsis />
          </div> */}
        <Switch
          id={alarm.id}
          checked={alarm.isOn}
          onChange={(e) => {
            mutate({ id: alarm.id, isOn: e.currentTarget.checked });
          }}
        />
      </div>
    </li>
  );
};

export default Alarm;
