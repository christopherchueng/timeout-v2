import { RouterOutputs } from "@/trpc/shared";

export type AlarmlistWithAlarms = {
  alarmlist: RouterOutputs["alarmlist"]["getAllWithAlarms"][number];
};
