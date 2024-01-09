"use client";

import clsx from "clsx";
import { Switch } from "../UI";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import { AlarmIcon } from "../UI";
import { formatMinutes, formatRepeatDays } from "@/utils";
import { useCallback, useRef, useState } from "react";
import {
  useCursorPosition,
  useSettingsActions,
  useSnoozeCountdown,
} from "@/hooks";
import { Settings } from "../Settings";
import toast from "react-hot-toast";
import Modal from "../Modal";
import UpdateAlarmForm from "./UpdateForm";
import Snooze from "../Snooze";
import dayjs, { type Dayjs } from "dayjs";
import AbbreviatedDays from "./AbbreviatedDays";
import { weekdaysData } from "@/utils/constants";

type Alarm = RouterOutputs["alarm"]["getAllByAlarmlistId"][number];

type AlarmProps = {
  alarm: Alarm;
  handleAlarmlistToggle: (updatedAlarms: Alarm[], isOn: boolean) => void;
};

const Alarm = ({ alarm, handleAlarmlistToggle }: AlarmProps) => {
  const ellipsisRef = useRef<HTMLDivElement>(null);

  const [isUpdatingAlarm, setIsUpdatingAlarm] = useState(false);
  const [snoozeTime, setSnoozeTime] = useState<Date | Dayjs | number>(0);

  const { isAlarmRinging, setIsAlarmRinging } = useSnoozeCountdown(
    snoozeTime,
    alarm,
    weekdaysData,
  );
  const { settingsTab, openSettings, closeSettings, setSettingsTab } =
    useSettingsActions();
  const { cursorPosition, onMouseMove } = useCursorPosition();

  const ctx = api.useUtils();

  const { mutate: toggleAlarm } = api.alarm.toggle.useMutation({
    onMutate: async ({ id, isOn }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarm.getAllByAlarmlistId.cancel({
        alarmlistId: alarm.alarmlistId,
      });

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

    onSuccess: (data) => {
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
      void ctx.alarmlist.getAllWithAlarms.invalidate();
    },
  });

  const { mutate: deleteAlarm } = api.alarm.delete.useMutation({
    onMutate: async ({ id }) => {
      await ctx.alarm.getAllByAlarmlistId.cancel({
        alarmlistId: alarm.alarmlistId,
      });

      const previousAlarms = ctx.alarm.getAllByAlarmlistId.getData({
        alarmlistId: alarm.alarmlistId,
      });

      ctx.alarm.getAllByAlarmlistId.setData(
        { alarmlistId: alarm.alarmlistId },
        (prev) => {
          if (!prev) return previousAlarms;

          return prev.filter((prevAlarm) => prevAlarm.id !== id);
        },
      );

      // Return a context object with the snapshotted value
      return { previousAlarms };
    },
    onSuccess: (data) => {
      toast.success(`'${data.name}' has been deleted.`);
      void ctx.alarmlist.getAllWithAlarms.invalidate();
    },
    onError: (_data, _payload, context) => {
      toast.error(
        `An error occurred while deleting ${alarm.name}. Please try again.`,
      );

      if (!context) return;

      ctx.alarmlist.getAll.setData(undefined, () => context.previousAlarms);
    },
  });

  const handleEditAlarm = useCallback(() => {
    closeSettings();
    // Open edit alarm modal
    setIsUpdatingAlarm(true);
  }, []);

  const handleDeleteAlarm = useCallback(() => {
    closeSettings();
    deleteAlarm({ id: alarm.id });
  }, []);

  const handleSnoozeClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (e.currentTarget.value === "Snooze") {
        setSnoozeTime(dayjs().add(10, "minute"));
      }

      if (e.currentTarget.value === "Demo snooze") {
        setSnoozeTime(dayjs().add(10, "second"));
      }

      setIsAlarmRinging(false);
    },
    [],
  );

  const displayRepeatDays = () => {
    if (!alarm.repeat) return null;

    const repeatedDays = formatRepeatDays(alarm.repeat.split(","));

    return (
      <>
        <span>&#8226;</span>
        <div className="flex gap-1 font-normal">
          {repeatedDays === "Individual"
            ? Object.entries(weekdaysData).map(([_, { value, abbr }]) => (
                <AbbreviatedDays
                  key={abbr}
                  abbrDay={abbr}
                  value={Number(value)}
                  repeatedDays={alarm.repeat?.split(",")}
                  isOn={alarm.isOn}
                />
              ))
            : repeatedDays}
        </div>
      </>
    );
  };

  return (
    <li
      onMouseEnter={() =>
        setSettingsTab((prev) => ({ ...prev, isHovering: true }))
      }
      onMouseLeave={() =>
        setSettingsTab((prev) => ({ ...prev, isHovering: false }))
      }
      className="group relative mt-0.5 flex h-10 flex-row items-center justify-between rounded-lg border border-transparent py-1 pl-4 pr-2 transition duration-200 hover:bg-gray-200"
    >
      <div className="absolute flex w-3/4 items-center gap-2 group-hover:w-[73%]">
        <AlarmIcon isOn={alarm.isOn} />
        <div
          className={clsx("flex select-none flex-col transition", {
            "text-gray-400": !alarm.isOn,
          })}
        >
          <div className="flex items-end gap-0.5 text-sm font-semibold">
            <span className="leading-tight">
              {alarm.hour}:{formatMinutes(alarm.minutes)}
            </span>
            <div className="flex gap-1 text-2xs">
              <span>{alarm.meridiem}</span>
              {displayRepeatDays()}
            </div>
          </div>
          <div className="text-xs">{alarm.name}</div>
        </div>
      </div>
      <div className="absolute right-1 inline-flex w-auto gap-1.5">
        <button
          onClick={(e) => {
            openSettings();
            onMouseMove(e);
          }}
        >
          <Settings
            ref={ellipsisRef}
            action="Alarm"
            handleEditAction={handleEditAlarm}
            handleDeleteAction={handleDeleteAlarm}
            closeSettings={closeSettings}
            isOpen={settingsTab.isOpen}
            isHovering={settingsTab.isHovering}
            cursorPosition={cursorPosition}
          />
        </button>
        <Switch
          id={alarm.id}
          checked={alarm.isOn}
          onChange={(e) => {
            toggleAlarm({ id: alarm.id, isOn: e.currentTarget.checked });
          }}
        />
      </div>
      {isUpdatingAlarm && (
        <Modal
          isOpen={isUpdatingAlarm}
          handleClose={() => setIsUpdatingAlarm((prev) => !prev)}
        >
          <UpdateAlarmForm alarm={alarm} setIsModalOpen={setIsUpdatingAlarm} />
        </Modal>
      )}
      <Snooze
        alarm={alarm}
        isAlarmRinging={isAlarmRinging}
        handleClose={() => setIsAlarmRinging(false)}
        handleSnoozeClick={handleSnoozeClick}
      />
    </li>
  );
};

export default Alarm;
