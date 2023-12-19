import type { Alarm } from "@prisma/client";
import { TOGGLE_ALARMLIST_AND_ALARMS, TOGGLE_ALARMLIST } from "./constants";

type InitialState = {
  isOn: boolean;
  alarms: Alarm[];
};

type Action = {
  type: string;
  alarms: Alarm[];
  isOn: boolean;
};

const initialState = {
  isOn: false,
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
        isOn: action.isOn,
      }));

      return {
        ...state,
        isOn: action.isOn,
        alarms: activeAlarms,
      };
    }
    case TOGGLE_ALARMLIST: {
      return {
        ...state,
        isOn: action.isOn,
        alarms: action.alarms,
      };
    }
    default:
      return state;
  }
};
