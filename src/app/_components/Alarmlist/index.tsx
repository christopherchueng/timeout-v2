"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import clsx from "clsx";
import { api } from "@/trpc/react";
import { alarmlistReducer } from "@/store/AlarmlistReducer";
import {
  TOGGLE_ALARMLIST,
  TOGGLE_ALARMLIST_AND_ALARMS,
} from "@/store/constants";
import Alarm from "../Alarm";
import { Switch } from "../UI";
import AlarmlistIcon from "../UI/AlarmlistIcon";
import Ellipsis from "../UI/Ellipsis";
import Settings from "./Settings";
import type { AlarmlistWithAlarms } from "@/types";

const Alarmlist = ({ alarmlist }: AlarmlistWithAlarms) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const initialState = {
    isOn: alarmlist.isOn,
    alarms: alarmlist.alarms,
  };
  const [state, dispatch] = useReducer(alarmlistReducer, initialState);
  const { isOn, alarms } = state;

  const [isDeleteAlarmlistModalOpen, setIsDeleteAlarmlistModalOpen] =
    useState(false);

  const ctx = api.useUtils();

  const { mutate } = api.alarmlist.toggle.useMutation({
    onMutate: async ({ id, isOn }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarmlist.getAllWithAlarms.cancel();

      // Snapshot the previous value
      const previousAlarmlists = ctx.alarmlist.getAllWithAlarms.getData();

      // Optimistically update to the new value
      ctx.alarmlist.getAllWithAlarms.setData(undefined, (prev) => {
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

    onSuccess: (_data, { isOn }) => {
      dispatch({
        type: TOGGLE_ALARMLIST_AND_ALARMS,
        alarms,
        isOn,
      });
    },

    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_err, _isOn, context) => {
      if (!context) return;
      ctx.alarmlist.getAllWithAlarms.setData(
        undefined,
        () => context.previousAlarmlists,
      );
    },
    // Always refetch after error or success:
    onSettled: () => {
      void ctx.alarmlist.getAllWithAlarms.invalidate();
    },
  });

  const handleAlarmlistToggle = useCallback(
    (updatedAlarms: Alarm[], isOn: boolean) => {
      dispatch({
        type: TOGGLE_ALARMLIST,
        alarms: updatedAlarms,
        isOn,
      });
    },
    [],
  );

  const handleDeleteAlarmlistModal = useCallback(() => {
    setIsSettingsOpen((prev) => !prev);
    setIsDeleteAlarmlistModalOpen((prev) => !prev);
  }, []);

  if (!alarms) return <div>No alarms</div>;

  return (
    <ul className="px-4">
      <li className="group relative flex h-10 items-center justify-between rounded-lg border border-transparent px-2 py-2 text-sm transition duration-200 hover:bg-gray-200">
        {/*
          Width is defined below to allow alarmlist name to truncate.
          Name will truncate even more on hover to account for ellipsis.
        */}
        <div className="absolute flex w-3/4 items-center gap-2 group-hover:w-[73%]">
          <div>
            <AlarmlistIcon isOn={isOn} />
          </div>
          <span
            className={clsx(
              "line-clamp-1 inline-block self-center truncate transition",
              {
                "text-gray-400": !isOn,
              },
            )}
          >
            {alarmlist.name}
          </span>
        </div>
        <div className="absolute right-1 inline-flex w-auto gap-1.5">
          <div className="relative" onClick={() => setIsSettingsOpen(true)}>
            <Ellipsis />
            {isSettingsOpen && (
              <Settings
                alarmlist={alarmlist}
                isSettingsOpen={isSettingsOpen}
                isDeleteAlarmlistModalOpen={isDeleteAlarmlistModalOpen}
                handleDeleteAlarmlistModal={handleDeleteAlarmlistModal}
              />
            )}
          </div>
          <Switch
            id={alarmlist.id}
            checked={isOn}
            onChange={(e) => {
              mutate({ id: alarmlist.id, isOn: e.currentTarget.checked });
            }}
          />
        </div>
      </li>
      {alarms.map((alarm) => (
        <Alarm
          key={alarm.id}
          alarm={alarm}
          handleAlarmlistToggle={handleAlarmlistToggle}
        />
      ))}
    </ul>
  );
};

export default Alarmlist;
