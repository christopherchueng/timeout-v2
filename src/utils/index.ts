import { z } from "zod";

export const alarmlistSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please enter a name." })
    .max(20, { message: "Name must contain at most 20 character(s)." }),
});
