"use client";

import { useCallback, useReducer, useRef, useState } from "react";
import clsx from "clsx";
import { api } from "@/trpc/react";
import { alarmlistReducer } from "@/store";
import {
  TOGGLE_ALARMLIST,
  TOGGLE_ALARMLIST_AND_ALARMS,
} from "@/store/constants";
import Alarm from "../Alarm";
import { Switch } from "../UI";
import AlarmlistIcon from "../UI/AlarmlistIcon";
import Ellipsis from "../UI/Ellipsis";
import type { AlarmlistWithAlarms } from "@/types";
import DeleteAlarmlistForm from "./DeleteAlarmlistForm";
import SettingsWrapper from "./SettingsWrapper";
import Settings from "./Settings";

type SettingStatus = {
  isOpen: boolean;
  isHovering: boolean;
  isDeleteConfirmationOpen: boolean;
};

const Alarmlist = ({ alarmlist }: AlarmlistWithAlarms) => {
  const settingsRef = useRef<HTMLInputElement | null>(null);

  const [settingsTab, setSettingsTab] = useState<SettingStatus>({
    isHovering: false,
    isOpen: false,
    isDeleteConfirmationOpen: false,
  });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const initialState = {
    isOn: alarmlist.isOn,
    alarms: alarmlist.alarms,
  };
  const [state, dispatch] = useReducer(alarmlistReducer, initialState);
  const { isOn, alarms } = state;

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

  const handleDeleteClick = useCallback(({ target }: MouseEvent) => {
    // Clicking on "Delete" closes settings tab and opens delete modal
    if (settingsRef?.current && settingsRef.current?.contains(target as Node)) {
      setSettingsTab({
        isOpen: false,
        isHovering: false,
        isDeleteConfirmationOpen: true,
      });
    } else if (
      // Close settings outside modal
      settingsRef?.current &&
      !settingsRef.current?.contains(target as Node)
    ) {
      setSettingsTab({
        isHovering: false,
        isOpen: false,
        isDeleteConfirmationOpen: false,
      });
    }
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
      setCursorPosition({ x: e.clientX, y: e.clientY }),
    [settingsTab.isOpen],
  );

  const handleSettingsClick = useCallback(() => {
    setSettingsTab({
      isOpen: false,
      isHovering: true,
      isDeleteConfirmationOpen: true,
    });
  }, []);

  if (!alarms) return <div>No alarms</div>;

  return (
    <>
      <li
        onMouseEnter={() =>
          setSettingsTab((prev) => ({ ...prev, isHovering: true }))
        }
        onMouseLeave={() =>
          setSettingsTab((prev) => ({ ...prev, isHovering: false }))
        }
        className="relative flex h-10 items-center justify-between rounded-lg border border-transparent px-2 py-2 text-sm transition duration-200 hover:bg-gray-200"
      >
        {/*
          Width is defined below to allow alarmlist name to truncate.
          Name will truncate even more on hover to account for ellipsis.
        */}
        <div
          className={clsx(
            settingsTab.isHovering && "w-[73%]",
            "absolute flex w-3/4 items-center gap-2",
          )}
        >
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
          <div
            onClick={(e) => {
              setSettingsTab((prev) => ({ ...prev, isOpen: true }));
              onMouseMove(e);
            }}
          >
            <div className="relative">
              {settingsTab.isHovering && (
                <Ellipsis isSettingsTabOpen={settingsTab.isOpen} />
              )}
              {settingsTab.isOpen && (
                <SettingsWrapper
                  ref={settingsRef}
                  isOpen={settingsTab.isOpen}
                  handleClose={handleDeleteClick}
                  cursorPosition={cursorPosition}
                >
                  <Settings handleSettingsClick={handleSettingsClick} />
                </SettingsWrapper>
              )}
            </div>
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
      {settingsTab.isDeleteConfirmationOpen && (
        <DeleteAlarmlistForm
          alarmlist={alarmlist}
          isDeleteAlarmlistModalOpen={settingsTab.isDeleteConfirmationOpen}
          handleCloseModal={() =>
            setSettingsTab((prev) => ({
              ...prev,
              isOpen: false,
              isDeleteConfirmationOpen: false,
            }))
          }
        />
      )}
    </ul>
  );
};

export default Alarmlist;
