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
import { useWindowDimensions } from "@/hooks";
import RenameAlarmlistForm from "../RenameAlarmlistForm";
import Settings from "./Settings";

type SettingStatus = {
  isOpen: boolean;
  isHovering: boolean;
  isDeleteConfirmationOpen: boolean;
  isEditingAlarmlist?: boolean;
};

const Alarmlist = ({ alarmlist }: AlarmlistWithAlarms) => {
  const settingsRef = useRef<HTMLDivElement | null>(null);

  const [settingsTab, setSettingsTab] = useState<SettingStatus>({
    isHovering: false,
    isOpen: false,
    isDeleteConfirmationOpen: false,
    isEditingAlarmlist: false,
  });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const initialState = {
    isOn: alarmlist.isOn,
    alarms: alarmlist.alarms,
  };
  const [state, dispatch] = useReducer(alarmlistReducer, initialState);
  const { isOn, alarms } = state;

  const { width } = useWindowDimensions();

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

  const handleSettingsAction = useCallback((e: MouseEvent) => {
    // Clicking on "Delete" closes settings tab and opens delete modal
    if (
      settingsRef?.current &&
      settingsRef.current?.contains(e.target as Node)
    ) {
      setSettingsTab((prev) => ({
        ...prev,
        isOpen: false,
        isHovering: false,
      }));
    } else if (
      // Close settings outside modal
      settingsRef?.current &&
      !settingsRef.current?.contains(e.target as Node)
    ) {
      setSettingsTab({
        isHovering: false,
        isOpen: false,
        isDeleteConfirmationOpen: false,
      });
    }
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setCursorPosition({
        x: width! >= 640 ? e.clientX - 5 : e.clientX - 80,
        y: e.clientY + 10,
      });
    },
    [settingsTab.isOpen, width],
  );

  const handleDeleteAction = useCallback(() => {
    setSettingsTab({
      isOpen: false,
      isHovering: true,
      isDeleteConfirmationOpen: true,
      isEditingAlarmlist: false,
    });
  }, []);

  const handleRenameAction = useCallback(() => {
    setSettingsTab({
      isOpen: false,
      isHovering: false,
      isDeleteConfirmationOpen: false,
      isEditingAlarmlist: true,
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
        className={clsx(
          settingsTab.isHovering && "bg-gray-200",
          "relative flex h-10 items-center justify-between rounded-lg border border-transparent px-2 py-2 text-sm transition duration-200",
        )}
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
          <AlarmlistIcon isOn={isOn} />
          {settingsTab.isEditingAlarmlist ? (
            <RenameAlarmlistForm alarmlist={alarmlist} />
          ) : (
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
          )}
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
                  cursorPosition={cursorPosition}
                  handleClose={(e) => handleSettingsAction(e)}
                >
                  <Settings
                    handleRenameAction={handleRenameAction}
                    handleDeleteAction={handleDeleteAction}
                  />
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
    </>
  );
};

export default Alarmlist;
