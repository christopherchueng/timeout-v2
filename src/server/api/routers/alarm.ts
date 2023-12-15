import { z } from "zod";

import type { Alarm } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getServerAuthSession } from "@/server/auth";
import { TRPCError } from "@trpc/server";

const addUserDataToAlarm = async (alarms: Alarm[]) => {
  const session = await getServerAuthSession();

  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User for alarmlist not found",
    });
  }

  return alarms.map((alarm) => {
    return {
      alarm,
      user: {
        ...session.user,
      },
    };
  });
};

export const alarmRouter = createTRPCRouter({
  getAlarmsByAlarmlistId: protectedProcedure
    .input(
      z.object({
        alarmlistId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const alarmlist = await ctx.db.alarmlist.findFirst({
        where: {
          id: input.alarmlistId,
        },
      });

      if (!alarmlist) throw new TRPCError({ code: "NOT_FOUND" });

      const alarms = await ctx.db.alarm.findMany({
        where: {
          alarmlistId: input.alarmlistId,
        },
      });

      if (!alarms)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `There are no alarms under ${alarmlist.name}. Create a new alarm!`,
        });

      return alarms;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        hour: z.number(),
        minutes: z.number(),
        meridiem: z.string(),
        sound: z.string().optional(),
        repeat: z.string().optional(),
        snooze: z.boolean(),
        alarmlistId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alarm.create({
        data: {
          name: input.name,
          hour: input.hour,
          minutes: input.minutes,
          meridiem: input.meridiem,
          sound: input.sound,
          repeat: input.repeat,
          snooze: input.snooze,
          isOn: true,
          alarmlistId: input.alarmlistId,
          userId: input.userId,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        hour: z.number(),
        minutes: z.number(),
        meridiem: z.string(),
        sound: z.string().optional(),
        repeat: z.string().optional(),
        snooze: z.boolean(),
        alarmlistId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const alarmlist = await ctx.db.alarmlist.findFirst({
        where: {
          id: input.alarmlistId,
        },
      });

      if (!alarmlist) throw new TRPCError({ code: "NOT_FOUND" });

      const alarm = ctx.db.alarm.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          hour: input.hour,
          minutes: input.minutes,
          meridiem: input.meridiem,
          sound: input.sound,
          repeat: input.repeat,
          snooze: input.snooze,
          isOn: true,
          alarmlistId: input.alarmlistId,
        },
      });

      return alarm;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alarm.delete({
        where: {
          id: input.id,
        },
      });
    }),
  toggleAlarm: protectedProcedure
    .input(z.object({ id: z.string(), isOn: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const alarm = ctx.db.alarm.update({
        where: {
          id: input.id,
        },
        data: {
          isOn: input.isOn,
        },
      });

      return alarm;
    }),
});
