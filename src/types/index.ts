import type { RouterOutputs } from "@/trpc/shared";
import type {
  createAlarmSchema,
  createAlarmlistSchema,
  renameAlarmlistSchema,
  updateAlarmSchema,
} from "@/utils";
import type { z } from "zod";

export type AlarmlistWithAlarms =
  RouterOutputs["alarmlist"]["getAllWithAlarms"][number];
export type Alarmlist = RouterOutputs["alarmlist"]["getAll"][number];

export type CreateAlarmFormValues = z.infer<typeof createAlarmSchema>;
export type UpdateAlarmFormValues = z.infer<typeof updateAlarmSchema>;

export type CreateAlarmlistFormValues = z.infer<typeof createAlarmlistSchema>;
export type RenameAlarmlistFormValues = z.infer<typeof renameAlarmlistSchema>;
