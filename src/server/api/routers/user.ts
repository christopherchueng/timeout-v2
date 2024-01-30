import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const alarmlists = await ctx.db.alarmlist.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: [{ order: "asc" }],
      include: {
        alarms: true,
      },
    });

    if (!alarmlists) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Alarmlist not found",
      });
    }

    return {
      user: ctx.session.user,
      alarmlists,
    };
  }),
  rearrangeAlarmlists: protectedProcedure
    .input(
      z.object({
        newOrder: z
          .object({
            id: z.string(),
            name: z.string(),
            isOn: z.boolean(),
            order: z.number(),
            createdAt: z.date(),
            updatedAt: z.date(),
            userId: z.string(),
            alarms: z
              .object({
                id: z.string(),
                name: z.string(),
                hour: z.number(),
                minutes: z.number(),
                sound: z.string().nullable(),
                repeat: z.string().nullable(),
                snooze: z.boolean(),
                snoozeEndTime: z.date().nullable(),
                isOn: z.boolean(),
                createdAt: z.date(),
                updatedAt: z.date(),
                alarmlistId: z.string(),
                userId: z.string(),
              })
              .array(),
          })
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { newOrder } = input;
      const alarmlistMap: Record<string, number> = {};

      newOrder.forEach((alarmlist, index) => {
        alarmlistMap[alarmlist.id] = index + 1;
      });

      const alarmlists = await ctx.db.alarmlist.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });

      const updatedAlarmlists = alarmlists.map(async (alarmlist) => {
        await ctx.db.alarmlist.update({
          where: {
            id: alarmlist.id,
          },
          data: {
            order: alarmlistMap[alarmlist.id],
          },
        });
      });

      return {
        user: ctx.session.user,
        alarmlists: updatedAlarmlists,
      };
    }),
});
