import { z } from "zod";

export const alarmlistSchema = z.object({
  name: z.string().min(1, { message: "Please enter a name." }),
});
