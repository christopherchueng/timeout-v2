import { createTRPCRouter } from "@/server/api/trpc";
import { alarmlistRouter } from "./routers/alarmlist";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  alarmlist: alarmlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
