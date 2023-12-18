import type { Alarm, Alarmlist } from "@prisma/client";
import { TOGGLE_ALARMLIST_AND_ALARMS, TOGGLE_ALARMLIST } from "./constants";

type InitialState = {
  isAlarmlistOn: boolean;
  alarms: Alarm[];
};

type Action = {
  type: string;
  alarms: Alarm[];
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
      const activeAlarms = action.alarms.map((alarm: Alarm) => ({
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
