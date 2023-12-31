"use client";

import { useCallback, useReducer, useRef, useState } from "react";
import clsx from "clsx";
import { api } from "@/trpc/react";
import { useWindowDimensions } from "@/hooks";
import { alarmlistReducer } from "@/store";
import {
  RENAME_ALARMLIST,
  TOGGLE_ALARMLIST,
  TOGGLE_ALARMLIST_AND_ALARMS,
} from "@/store/constants";
import type { AlarmlistWithAlarms } from "@/types";
import Alarm from "../Alarm";
import { Chevron, Switch } from "../UI";
import AlarmlistIcon from "../UI/AlarmlistIcon";
import Ellipsis from "../UI/Ellipsis";
import DeleteAlarmlistForm from "./DeleteAlarmlistForm";
import SettingsWrapper from "./SettingsWrapper";
import RenameAlarmlistForm from "./RenameAlarmlistForm";
import Settings from "./Settings";
import { AccordionHeader, AccordionItem, AccordionPanel } from "../Accordian";

type SettingStatus = {
  isOpen: boolean;
  isHovering: boolean;
  isDeleteConfirmationOpen: boolean;
  isEditingAlarmlist?: boolean;
};

const Alarmlist = ({ alarmlist }: AlarmlistWithAlarms) => {
  const settingsRef = useRef<HTMLDivElement>(null);
  const ellipsisRef = useRef<HTMLDivElement>(null);

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHoveringIcon, setIsHoveringIcon] = useState(false);
  const [isShowingAlarms, setIsShowingAlarms] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingStatus>({
    isHovering: false,
    isOpen: false,
    isDeleteConfirmationOpen: false,
    isEditingAlarmlist: false,
  });

  const initialState = {
    name: alarmlist.name,
    isOn: alarmlist.isOn,
    alarms: alarmlist.alarms,
  };
  const [state, dispatch] = useReducer(alarmlistReducer, initialState);
  const { name, isOn, alarms } = state;

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

  const handleSettingsAction = useCallback((e: MouseEvent) => {
    // Clicking on "Delete" closes settings tab and opens delete modal
    if (
      settingsRef?.current &&
      settingsRef.current?.contains(e.target as Node)
    ) {
      setSettingsTab((prev) => ({
        ...prev,
        isOpen: false,
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
      isHovering: true,
      isDeleteConfirmationOpen: false,
      isEditingAlarmlist: true,
    });
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
        isDeleteConfirmationOpen: false,
        isEditingAlarmlist: false,
      });
    },
    [dispatch, name, settingsTab.isEditingAlarmlist],
  );

  const handleToggleAccordion = useCallback(
    (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      /*
        Accordion should not toggle if user clicks on settings/ellipsis.
        Accordion should remain the same status when opening/closing settings tab
        or if settings tab is open and gets clicked out.
        Otherwise, as long as click is within alarmlist header, accordion should open.

        Return boolean to help AccordionHeader decide whether
        onChange function should trigger.
      */
      if (
        (ellipsisRef?.current &&
          ellipsisRef.current?.contains(e.target as Node)) ||
        (ellipsisRef?.current &&
          !ellipsisRef.current?.contains(e.target as Node) &&
          settingsTab.isOpen)
      ) {
        setIsShowingAlarms((prev) => prev);
        return false;
      } else {
        setIsShowingAlarms((prev) => !prev);
        return true;
      }
    },
    [settingsTab.isOpen],
  );

  return (
    <AccordionItem>
      <AccordionHeader
        handleToggleAccordion={handleToggleAccordion}
        onMouseEnter={() => {
          !settingsTab.isEditingAlarmlist &&
            setSettingsTab((prev) => ({ ...prev, isHovering: true }));
          setIsHoveringIcon(true);
        }}
        onMouseLeave={() => {
          !settingsTab.isEditingAlarmlist &&
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
              <Chevron isOpen={isShowingAlarms} isToggleOn={isOn} />
            ) : (
              <AlarmlistIcon isOn={isOn} />
            )}
          </div>
          {settingsTab.isEditingAlarmlist ? (
            <RenameAlarmlistForm
              alarmlist={alarmlist}
              handleCloseRename={handleCloseRename}
            />
          ) : (
            <span
              className={clsx(
                "line-clamp-1 inline-block self-center truncate transition",
                {
                  "text-gray-400": !isOn,
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
              setSettingsTab((prev) => ({ ...prev, isOpen: true }));
              onMouseMove(e);
            }}
          >
            <div className="relative" ref={ellipsisRef}>
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
      </AccordionHeader>
      <AccordionPanel>
        {!!alarms.length ? (
          <ul>
            {alarms.map((alarm) => (
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
    </AccordionItem>
  );
};

export default Alarmlist;
