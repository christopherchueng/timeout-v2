import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getServerAuthSession } from "@/server/auth";
import { TRPCError } from "@trpc/server";

export const alarmlistRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const session = await getServerAuthSession();

    if (!session) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User not found",
      });
    }

    const alarmlistsWithAlarms = await ctx.db.alarmlist.findMany({
      where: {
        userId: session?.user.id,
      },
      take: 10,
      orderBy: [{ createdAt: "desc" }],
      include: {
        alarms: true,
      },
    });

    const alarmlists = alarmlistsWithAlarms.map((alarmlist) => {
      const newAlarmlist = {
        id: alarmlist.id,
        name: alarmlist.name,
        isOn: alarmlist.isOn,
        createdAt: alarmlist.createdAt,
        updatedAt: alarmlist.updatedAt,
        userId: alarmlist.userId,
        alarms: alarmlist.alarms.filter(
          (alarm) => alarmlist.id === alarm.alarmlistId,
        ),
      };

      return newAlarmlist;
    });

    return alarmlists;
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const alarmlist = await ctx.db.alarmlist.findUnique({
        where: {
          id: input.id,
        },
        include: {
          alarms: true,
        },
      });

      if (!alarmlist) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Alarmlist not found",
        });
      }

      return alarmlist;
    }),
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alarmlist.create({
        data: {
          name: input.name,
          user: { connect: { id: ctx.session.user.id } },
          isOn: true,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isOn: z.boolean().optional(),
        name: z.string().min(1, { message: "Please enter a name." }),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.alarmlist.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alarmlist.delete({
        where: {
          id: input.id,
        },
      });
    }),
  toggleWithAlarms: protectedProcedure
    .input(z.object({ id: z.string(), isOn: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.alarm.updateMany({
        where: {
          alarmlistId: input.id,
        },
        data: {
          isOn: input.isOn,
        },
      });

      const alarmlist = await ctx.db.alarmlist.update({
        where: {
          id: input.id,
        },
        data: {
          isOn: input.isOn,
        },
        include: {
          alarms: true,
        },
      });

      return alarmlist;
    }),
});
