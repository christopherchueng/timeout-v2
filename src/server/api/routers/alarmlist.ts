import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getServerAuthSession } from "@/server/auth";
import { TRPCError } from "@trpc/server";
import { createAlarmlistSchema, renameAlarmlistSchema } from "@/utils";

export const alarmlistRouter = createTRPCRouter({
  getAllWithAlarms: protectedProcedure.query(async ({ ctx }) => {
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
      orderBy: [{ createdAt: "desc" }],
      include: {
        alarms: {
          orderBy: [{ meridiem: "asc" }, { hour: "asc" }, { minutes: "asc" }],
        },
      },
    });

    const alarmlists = alarmlistsWithAlarms.map((alarmlist) => {
      const { id, name, isOn, createdAt, updatedAt, userId, alarms } =
        alarmlist;
      const newAlarmlist = {
        id,
        name,
        isOn,
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
      orderBy: [{ createdAt: "desc" }],
    });

    const alarmlists = alarmlistsWithAlarms.map((alarmlist) => {
      const { id, name, isOn, createdAt, updatedAt, userId } = alarmlist;
      const newAlarmlist = {
        id,
        name,
        isOn,
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

      const alarmlist = await ctx.db.alarmlist.create({
        data: {
          name,
          user: { connect: { id: ctx.session.user.id } },
          isOn: true,
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
