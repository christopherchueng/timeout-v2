"use client";

import { useCallback, useReducer, useRef, useState } from "react";
import clsx from "clsx";
import { api } from "@/trpc/react";
import { useCursorPosition, useSettingsActions } from "@/hooks";
import { alarmlistReducer } from "@/store";
import {
  RENAME_ALARMLIST,
  TOGGLE_ALARMLIST,
  TOGGLE_ALARMLIST_AND_ALARMS,
} from "@/store/constants";
import type { AlarmlistWithAlarms } from "@/types";
import Alarm from "../Alarm";
import DeleteAlarmlistForm from "./DeleteForm";
import RenameAlarmlistForm from "./RenameForm";
import { Settings } from "../Settings";
import { AccordionHeader, AccordionItem, AccordionPanel } from "../Accordian";
import { AlarmlistIcon, Chevron, Switch } from "../UI";

const Alarmlist = ({ alarmlist }: { alarmlist: AlarmlistWithAlarms }) => {
  const ellipsisRef = useRef<HTMLDivElement>(null);

  const [isHoveringIcon, setIsHoveringIcon] = useState(false);
  const [isShowingAlarms, setIsShowingAlarms] = useState(false);
  const [isEditingAlarmlist, setIsEditingAlarmlist] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const { onMouseMove, cursorPosition } = useCursorPosition();
  const { settingsTab, closeSettings, openSettings, setSettingsTab } =
    useSettingsActions();

  const initialState = {
    name: alarmlist.name,
    isOn: alarmlist.isOn,
    alarms: alarmlist.alarms,
  };
  const [state, dispatch] = useReducer(alarmlistReducer, initialState);
  const { name, isOn, alarms } = state;

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

      return { previousAlarmlists };
    },

    onSuccess: (_data, { isOn }) => {
      dispatch({
        ...state,
        type: TOGGLE_ALARMLIST_AND_ALARMS,
        alarms,
        isOn,
      });
      void ctx.alarmlist.getAllWithAlarms.invalidate();
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
  });

  const handleAlarmlistToggle = useCallback(
    (updatedAlarms: Alarm[], isOn: boolean) => {
      dispatch({
        ...state,
        type: TOGGLE_ALARMLIST,
        alarms: updatedAlarms,
        isOn,
      });
    },
    [],
  );

  const handleDeleteAction = useCallback(() => {
    setSettingsTab({
      isOpen: false,
      isHovering: true,
    });
    setIsDeleteConfirmationOpen(true);
  }, []);

  const handleRenameAction = useCallback(() => {
    setSettingsTab({
      isOpen: false,
      isHovering: true,
    });
    setIsEditingAlarmlist(true);
  }, []);

  const handleCloseRename = useCallback(
    (name?: string | undefined) => {
      if (name) {
        dispatch({
          ...state,
          type: RENAME_ALARMLIST,
          name,
        });
      }

      setSettingsTab({
        isOpen: false,
        isHovering: false,
      });
      setIsEditingAlarmlist(false);
    },
    [dispatch, name, isEditingAlarmlist],
  );

  const handleToggleAccordion = useCallback(
    (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      /*
        Accordion should not toggle if user clicks on settings/ellipsis.
        Accordion should remain the same status when opening/closing settings tab
        or if settings tab is open and gets clicked out.
        Accordion should also not toggle if editing alarmlist
        Otherwise, as long as click is within alarmlist header, accordion should open.

        Return boolean to help AccordionHeader decide whether
        onChange function should trigger.
      */
      if (
        (ellipsisRef?.current?.contains(e.target as Node) ?? false) ||
        ((!ellipsisRef?.current?.contains(e.target as Node) &&
          (settingsTab.isOpen || isEditingAlarmlist)) ??
          false)
      ) {
        setIsShowingAlarms((prev) => prev);
        return false;
      } else {
        setIsShowingAlarms((prev) => !prev);
        return true;
      }
    },
    [settingsTab.isOpen, isEditingAlarmlist],
  );

  return (
    <AccordionItem>
      <AccordionHeader
        handleToggleAccordion={handleToggleAccordion}
        onMouseEnter={() => {
          !isEditingAlarmlist &&
            setSettingsTab((prev) => ({ ...prev, isHovering: true }));
          setIsHoveringIcon(true);
        }}
        onMouseLeave={() => {
          !isEditingAlarmlist &&
            setSettingsTab((prev) => ({ ...prev, isHovering: false }));
          setIsHoveringIcon(false);
        }}
        className={clsx(
          settingsTab.isHovering && "bg-gray-200",
          "relative flex h-10 cursor-pointer items-center justify-between rounded-lg border border-transparent px-2 py-2 text-sm transition duration-200",
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
          <div className="w-3.5">
            {isHoveringIcon ? (
              <Chevron isOpen={isShowingAlarms} isToggleOn={alarmlist.isOn} />
            ) : (
              <AlarmlistIcon isOn={alarmlist.isOn} />
            )}
          </div>
          {isEditingAlarmlist ? (
            <RenameAlarmlistForm
              alarmlist={alarmlist}
              handleCloseRename={handleCloseRename}
            />
          ) : (
            <span
              className={clsx(
                "line-clamp-1 inline-block self-center truncate transition",
                {
                  "text-gray-400": !alarmlist.isOn,
                },
              )}
              onDoubleClick={() => {
                setIsShowingAlarms((prev) => prev);
                handleRenameAction();
              }}
            >
              {name}
            </span>
          )}
        </div>
        <div className="absolute right-1 inline-flex w-auto gap-1.5">
          <div
            onClick={(e) => {
              openSettings();
              onMouseMove(e);
            }}
          >
            <Settings
              ref={ellipsisRef}
              action="Alarmlist"
              handleEditAction={handleRenameAction}
              handleDeleteAction={handleDeleteAction}
              closeSettings={closeSettings}
              isOpen={settingsTab.isOpen}
              isHovering={settingsTab.isHovering}
              cursorPosition={cursorPosition}
              handleAlarmlistModal={() => setIsDeleteConfirmationOpen(false)}
            />
          </div>
          <Switch
            id={alarmlist.id}
            checked={isOn || alarmlist.isOn}
            onChange={(e) => {
              mutate({ id: alarmlist.id, isOn: e.currentTarget.checked });
            }}
          />
        </div>
      </AccordionHeader>
      <AccordionPanel>
        {!!alarmlist.alarms.length ? (
          <ul>
            {alarmlist.alarms.map((alarm) => (
              <Alarm
                key={alarm.id}
                alarm={alarm}
                handleAlarmlistToggle={handleAlarmlistToggle}
              />
            ))}
          </ul>
        ) : (
          <p
            className={clsx(
              "flex h-full py-1 pl-4 pr-2 text-xs italic transition",
              isOn ? "text-slate-900" : "text-gray-400",
            )}
          >
            No alarms under '{name}'!
          </p>
        )}
      </AccordionPanel>
      {isDeleteConfirmationOpen && (
        <DeleteAlarmlistForm
          alarmlist={alarmlist}
          isDeleteAlarmlistModalOpen={isDeleteConfirmationOpen}
          handleCloseModal={() => {
            setSettingsTab((prev) => ({
              ...prev,
              isOpen: false,
            }));
            setIsDeleteConfirmationOpen(false);
          }}
        />
      )}
    </AccordionItem>
  );
};

export default Alarmlist;
