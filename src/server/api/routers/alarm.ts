import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getServerAuthSession } from "@/server/auth";
import type { Meridiem } from "@/types";
import {
  convertHourTo24HourMode,
  createAlarmSchema,
  parseHour,
  parseMinutes,
  updateAlarmSchema,
} from "@/utils";

export const alarmRouter = createTRPCRouter({
  getAllByAlarmlistId: protectedProcedure
    .input(
      z.object({
        alarmlistId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { alarmlistId } = input;
      const alarmlist = await ctx.db.alarmlist.findFirst({
        where: {
          id: alarmlistId,
        },
      });

      if (!alarmlist) throw new TRPCError({ code: "NOT_FOUND" });

      const alarms = await ctx.db.alarm.findMany({
        where: {
          alarmlistId: alarmlistId,
        },
      });

      if (!alarms)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `There are no alarms under ${alarmlist.name}. Create a new alarm!`,
        });

      return alarms;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const session = await getServerAuthSession();

    if (!session) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User not found",
      });
    }

    const alarms = await ctx.db.alarm.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return alarms;
  }),
  create: protectedProcedure
    .input(createAlarmSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        hour,
        minutes,
        meridiem,
        repeat,
        snooze,
        alarmlistId,
        userId,
      } = input;

      const alarmlist = await ctx.db.alarmlist.findFirst({
        where: {
          id: alarmlistId,
        },
      });

      if (!alarmlist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Alarmlist not found! Please select another one.",
        });

      const preference = await ctx.db.preference.findFirst({
        where: { userId },
      });

      if (!preference)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized. Please sign in first and try again.",
        });

      if (
        preference.use12Hour &&
        (parseHour(hour) === 0 || parseHour(hour) > 12)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hour must be in between 1 and 12.",
        });
      }

      await ctx.db.alarmlist.update({
        where: {
          id: alarmlistId,
        },
        data: { isOn: true },
      });

      return ctx.db.alarm.create({
        data: {
          name: name || "Alarm",
          hour: convertHourTo24HourMode(
            parseHour(hour),
            meridiem as Meridiem,
            preference.use12Hour,
          ),
          minutes: parseMinutes(minutes),
          repeat,
          snooze,
          sound: process.env.NEXT_PUBLIC_SOUND_URL,
          isOn: true,
          alarmlistId,
          userId,
        },
      });
    }),
  update: protectedProcedure
    .input(updateAlarmSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        hour,
        minutes,
        meridiem,
        repeat,
        snooze,
        alarmlistId,
        userId,
      } = input;

      const currentAlarm = await ctx.db.alarm.findFirst({
        where: { id },
      });

      if (!currentAlarm) throw new TRPCError({ code: "NOT_FOUND" });

      const alarmlist = await ctx.db.alarmlist.findFirst({
        where: {
          id: alarmlistId,
        },
      });

      if (!alarmlist) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.alarmlist.update({
        where: {
          id: alarmlistId,
        },
        data: { isOn: true },
      });

      const preference = await ctx.db.preference.findFirst({
        where: { userId },
      });

      if (!preference)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized. Please sign in first and try again.",
        });

      if (
        preference.use12Hour &&
        (parseHour(hour) === 0 || parseHour(hour) > 12)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hour must be in between 1 and 12.",
        });
      }

      const alarm = await ctx.db.alarm.update({
        where: { id },
        data: {
          name: name || "Alarm",
          hour: convertHourTo24HourMode(
            parseHour(hour),
            meridiem as Meridiem,
            preference.use12Hour,
          ),
          minutes: parseMinutes(minutes),
          repeat,
          snooze,
          isOn: true,
          alarmlistId,
        },
      });

      if (currentAlarm.alarmlistId !== alarmlistId) {
        const alarmsInOldAlarmlist = await ctx.db.alarm.findMany({
          where: { alarmlistId: currentAlarm.alarmlistId },
        });

        const activeAlarms = alarmsInOldAlarmlist.filter((alarm) => alarm.isOn);

        await ctx.db.alarmlist.update({
          where: { id: currentAlarm.alarmlistId },
          data: { isOn: activeAlarms.length > 0 },
        });
      }

      return alarm;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      const { id } = input;
      return ctx.db.alarm.delete({
        where: { id },
      });
    }),
  toggle: protectedProcedure
    .input(z.object({ id: z.string(), isOn: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { id, isOn } = input;

      // Update the individual alarm
      const updatedAlarm = await ctx.db.alarm.update({
        where: { id },
        data: { isOn },
      });

      // Retrieve all alarms under the same alarmlist
      const alarmsInAlarmlist = await ctx.db.alarm.findMany({
        where: { alarmlistId: updatedAlarm.alarmlistId },
      });

      const activeAlarms = alarmsInAlarmlist.filter((alarm) => alarm.isOn);

      // Alarmlist should be on as long as there is at least 1 alarm on.
      // Otherwise, turn off alarmlist.
      const alarmlist = await ctx.db.alarmlist.update({
        where: { id: updatedAlarm.alarmlistId },
        data: { isOn: activeAlarms.length > 0 },
      });

      return { alarm: updatedAlarm, alarms: alarmsInAlarmlist, alarmlist };
    }),
  setSnoozeTime: protectedProcedure
    .input(z.object({ id: z.string(), time: z.date().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { id, time } = input;

      return await ctx.db.alarm.update({
        where: { id },
        data: { snoozeEndTime: time },
      });
    }),
});
