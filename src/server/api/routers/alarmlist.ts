import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createAlarmlistSchema, renameAlarmlistSchema } from "@/utils";

export const alarmlistRouter = createTRPCRouter({
  getAllWithAlarms: protectedProcedure.query(async ({ ctx }) => {
    const alarmlistsWithAlarms = await ctx.db.alarmlist.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: [{ order: "asc" }],
      // orderBy: [{ createdAt: "desc" }],
      include: {
        alarms: {
          orderBy: [{ hour: "asc" }, { minutes: "asc" }, { name: "asc" }],
        },
      },
    });

    const alarmlists = alarmlistsWithAlarms.map((alarmlist) => {
      const { id, name, isOn, order, createdAt, updatedAt, userId, alarms } =
        alarmlist;
      const newAlarmlist = {
        id,
        name,
        isOn,
        order,
        createdAt,
        updatedAt,
        userId,
        alarms: alarms.filter((alarm) => alarmlist.id === alarm.alarmlistId),
      };

      return newAlarmlist;
    });

    return alarmlists;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const alarmlistsWithAlarms = await ctx.db.alarmlist.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: [{ order: "asc" }],
      // orderBy: [{ createdAt: "desc" }],
    });

    const alarmlists = alarmlistsWithAlarms.map((alarmlist) => {
      const { id, name, isOn, order, createdAt, updatedAt, userId } = alarmlist;
      const newAlarmlist = {
        id,
        name,
        isOn,
        order,
        createdAt,
        updatedAt,
        userId,
      };

      return newAlarmlist;
    });

    return alarmlists;
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const alarmlist = await ctx.db.alarmlist.findUnique({
        where: { id },
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
    .input(createAlarmlistSchema)
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      await ctx.db.alarmlist.updateMany({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          order: {
            increment: 1,
          },
        },
      });

      const alarmlist = await ctx.db.alarmlist.create({
        data: {
          name,
          user: { connect: { id: ctx.session.user.id } },
          isOn: true,
          order: 1,
        },
      });
      return alarmlist;
    }),
  update: protectedProcedure
    .input(renameAlarmlistSchema)
    .mutation(({ ctx, input }) => {
      const { id, name } = input;
      return ctx.db.alarmlist.update({
        where: { id },
        data: { name },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const alarmlist = await ctx.db.alarmlist.findFirst({
        where: { id },
      });

      if (!alarmlist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find alarmlist.",
        });

      await ctx.db.alarmlist.updateMany({
        where: {
          userId: ctx.session.user.id,
          order: {
            gt: alarmlist.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });

      return ctx.db.alarmlist.delete({
        where: { id },
      });
    }),
  toggle: protectedProcedure
    .input(z.object({ id: z.string(), isOn: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { id, isOn } = input;
      await ctx.db.alarm.updateMany({
        where: { alarmlistId: id },
        data: { isOn },
      });

      const alarmlist = await ctx.db.alarmlist.update({
        where: { id },
        data: { isOn },
        include: {
          alarms: true,
        },
      });

      return alarmlist;
    }),
});
