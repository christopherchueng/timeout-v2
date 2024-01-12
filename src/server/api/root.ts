import { createTRPCRouter } from "@/server/api/trpc";
import { alarmlistRouter } from "./routers/alarmlist";
import { alarmRouter } from "./routers/alarm";
import { preferenceRouter } from "./routers/preference";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  alarmlist: alarmlistRouter,
  alarm: alarmRouter,
  preference: preferenceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
