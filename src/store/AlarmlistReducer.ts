import type { Alarm } from "@prisma/client";
import {
  TOGGLE_ALARMLIST_AND_ALARMS,
  TOGGLE_ALARMLIST,
  RENAME_ALARMLIST,
} from "./constants";

type InitialState = {
  name: string;
  isOn: boolean;
  alarms: Alarm[];
};

type Action = {
  type: string;
  name: string;
  alarms: Alarm[];
  isOn: boolean;
};

const initialState = {
  name: "",
  isOn: false,
  alarms: [],
};

export const alarmlistReducer = (
  state: InitialState = initialState,
  action: Action,
) => {
  switch (action.type) {
    case RENAME_ALARMLIST: {
      return {
        ...state,
        name: action.name,
      };
    }
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
