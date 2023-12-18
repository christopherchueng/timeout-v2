"use client";

import { RouterOutputs } from "@/trpc/shared";
import Alarm from "../Alarm";
import Switch from "../UI/Switch";
import { api } from "@/trpc/react";
import { useCallback, useReducer } from "react";
import type { Alarmlist, Alarm as TAlarm } from "@prisma/client";
import clsx from "clsx";

const TOGGLE_ALARMLIST_AND_ALARMS = "toggleAlarmlistAndAlarms";
const TOGGLE_ALARMLIST = "toggleAlarmlist";

type InitialState = {
  isAlarmlistOn: boolean;
  alarms: TAlarm[];
};

type Action = {
  type: string;
  alarmlist: Alarmlist;
  alarms: TAlarm[];
  isAlarmlistOn: boolean;
};

const initialState = {
  isAlarmlistOn: false,
  alarms: [],
};

export const alarmlistReducer = (
  state: InitialState = initialState,
  action: Action,
) => {
  switch (action.type) {
    case TOGGLE_ALARMLIST_AND_ALARMS: {
      const activeAlarms = action.alarms.map((alarm: TAlarm) => ({
        ...alarm,
        isOn: action.isAlarmlistOn,
      }));

      return {
        ...state,
        isAlarmlistOn: action.isAlarmlistOn,
        alarms: activeAlarms,
      };
    }
    case TOGGLE_ALARMLIST: {
      return {
        ...state,
        isAlarmlistOn: action.isAlarmlistOn,
        alarms: action.alarms,
      };
    }
    default:
      return state;
  }
};

type AlarmlistProps = RouterOutputs["alarmlist"]["getAll"][number];

const Alarmlist = (alarmlist: AlarmlistProps) => {
  const initialState = {
    isAlarmlistOn: alarmlist.isOn,
    alarms: alarmlist.alarms,
  };
  const [state, dispatch] = useReducer(alarmlistReducer, initialState);
  const { isAlarmlistOn, alarms } = state;

  const ctx = api.useUtils();

  const { mutate } = api.alarmlist.toggleWithAlarms.useMutation({
    onMutate: async ({ id, isOn }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarmlist.getAll.cancel();

      // Snapshot the previous value
      const previousAlarmlists = ctx.alarmlist.getAll.getData();

      // Optimistically update to the new value
      ctx.alarmlist.getAll.setData(undefined, (prev) => {
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
        alarmlist,
        alarms,
        isAlarmlistOn: isOn,
      });
      void ctx.alarmlist.getAll.invalidate();
    },

    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_err, _isOn, context) => {
      // toast.error(
      //   `An error occured when marking todo as ${done ? "done" : "undone"}`,
      // );
      if (!context) return;
      ctx.alarmlist.getAll.setData(undefined, () => context.previousAlarmlists);
    },
    // Always refetch after error or success:
    onSettled: () => {
      void ctx.alarmlist.getAll.invalidate();
    },
  });

  const handleAlarmlistToggle = useCallback(
    (updatedAlarmlist: Alarmlist, updatedAlarms: Alarm[], isOn: boolean) => {
      dispatch({
        type: TOGGLE_ALARMLIST,
        alarmlist: updatedAlarmlist,
        alarms: updatedAlarms,
        isAlarmlistOn: isOn,
      });
    },
    [],
  );

  if (!alarms) return <div>No alarms</div>;

  return (
    <div className="px-4">
      <div className="flex justify-between rounded-xl border border-transparent px-2 py-0.5 text-lg transition duration-200 hover:bg-gray-200">
        <span
          className={clsx("self-center font-bold", {
            "text-gray-400": !isAlarmlistOn,
          })}
        >
          {alarmlist.name}
        </span>
        <Switch
          id={alarmlist.id}
          checked={isAlarmlistOn}
          onChange={(e) => {
            mutate({ id: alarmlist.id, isOn: e.currentTarget.checked });
            dispatch({
              type: TOGGLE_ALARMLIST_AND_ALARMS,
              alarmlist,
              alarms,
              isAlarmlistOn: e.currentTarget.checked,
            });
          }}
        />
      </div>
      {alarms.map((alarm) => (
        <Alarm
          {...alarm}
          key={alarm.id}
          isAlarmlistOn={isAlarmlistOn}
          handleAlarmlistToggle={handleAlarmlistToggle}
        />
      ))}
    </div>
  );
};

export default Alarmlist;
