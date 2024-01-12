"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import { AlarmIcon, Switch } from "../UI";
import { formatMinutes, formatRepeatDays } from "@/utils";
import { weekdaysData } from "@/utils/constants";
import {
  useCursorPosition,
  useSettingsActions,
  useTriggerAlarm,
} from "@/hooks";
import { Settings } from "../Settings";
import Modal from "../Modal";
import Snooze from "../Snooze";
import UpdateAlarmForm from "./UpdateForm";
import AbbreviatedDays from "./AbbreviatedDays";
import { usePreferencesContext } from "@/context/Preferences";

type Alarm = RouterOutputs["alarm"]["getAllByAlarmlistId"][number];

type AlarmProps = {
  alarm: Alarm;
  handleAlarmlistToggle: (updatedAlarms: Alarm[], isOn: boolean) => void;
};

const Alarm = ({ alarm, handleAlarmlistToggle }: AlarmProps) => {
  const ellipsisRef = useRef<HTMLDivElement>(null);

  const [isUpdatingAlarm, setIsUpdatingAlarm] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(
    dayjs(alarm.snoozeEndTime).diff(dayjs(), "seconds"),
  );

  const { isAlarmTriggered } = useTriggerAlarm(alarm);
  const { settingsTab, openSettings, closeSettings, setSettingsTab } =
    useSettingsActions();
  const { cursorPosition, onMouseMove } = useCursorPosition();

  useEffect(() => {
    if (isAlarmTriggered) {
      setIsAlarmRinging(true);
      if (!alarm.snooze) {
        toggleAlarm({ id: alarm.id, isOn: false });
      }
    }
  }, [isAlarmTriggered, alarm.snooze]);

  const { preferences } = usePreferencesContext();

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

  const { mutate: saveSnoozeEndTime } = api.alarm.setSnoozeTime.useMutation({
    onMutate: async ({ id, time }) => {
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

          const newAlarms = prev.map((alarm: Alarm) => {
            if (alarm.id === id) {
              return {
                ...alarm,
                snoozeEndTime: time,
              };
            }

            return alarm;
          });

          return newAlarms;
        },
      );

      return { previousAlarms };
    },
    onSuccess: () => {
      void ctx.alarmlist.getAllWithAlarms.invalidate();
    },
    onError: (_data, _payload, context) => {
      toast.error("An error occurred while snoozing alarm. Please try again.");

      if (!context) return;

      ctx.alarmlist.getAll.setData(undefined, () => context.previousAlarms);
    },
  });

  useEffect(() => {
    if (alarm.snoozeEndTime) {
      setTimeLeft(dayjs(alarm.snoozeEndTime).diff(dayjs(), "seconds"));

      const timer = setInterval(
        () =>
          setTimeLeft((prev) => {
            if (prev > 0) {
              return prev - 1;
            } else {
              setIsAlarmRinging(true);

              return prev;
            }
          }),
        1000,
      );
      return () => clearInterval(timer);
    }
  }, [timeLeft, alarm.snoozeEndTime]);

  const handleEditAlarm = useCallback(() => {
    closeSettings();
    setIsUpdatingAlarm(true);
  }, []);

  const handleDeleteAlarm = useCallback(() => {
    closeSettings();
    deleteAlarm({ id: alarm.id });
  }, []);

  const handleSnoozeClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (e.currentTarget.innerText === "Snooze") {
        saveSnoozeEndTime({
          id: alarm.id,
          time: dayjs().add(10, "minute").toDate(),
        });
      }

      if (e.currentTarget.innerText === "Demo snooze") {
        saveSnoozeEndTime({
          id: alarm.id,
          time: dayjs().add(10, "second").toDate(),
        });
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

  const { hour, minutes, meridiem } = useMemo(() => {
    let hour;
    if (!preferences.use12Hour) {
      hour = dayjs().set("hour", alarm.hour).format("HH");
    } else hour = dayjs().set("hour", alarm.hour).format("h");

    const minutes = formatMinutes(alarm.minutes);
    const meridiem = alarm.hour >= 12 ? "PM" : "AM";

    return { hour, minutes, meridiem };
  }, [preferences.use12Hour, alarm.hour, alarm.minutes]);

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
          <div className="flex items-center gap-1 text-sm font-semibold">
            <span className="leading-tight">
              {hour}:{minutes}
            </span>
            <div className="flex gap-1 text-2xs">
              {preferences.use12Hour && <span>{meridiem}</span>}
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
        handleClose={() => {
          setIsAlarmRinging(false);
          saveSnoozeEndTime({ id: alarm.id, time: null });
        }}
        handleSnoozeClick={handleSnoozeClick}
      />
    </li>
  );
};

export default Alarm;
