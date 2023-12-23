import { RouterOutputs } from "@/trpc/shared";

export type Alarmlist = {
  alarmlist: RouterOutputs["alarmlist"]["getAll"][number];
};
