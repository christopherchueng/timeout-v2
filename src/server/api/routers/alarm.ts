import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createAlarmSchema, updateAlarmSchema } from "@/utils";
import { getServerAuthSession } from "@/server/auth";

// const addUserDataToAlarm = async (alarms: Alarm[]) => {
//   const session = await getServerAuthSession();

//   if (!session) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: "User for alarmlist not found",
//     });
//   }

//   return alarms.map((alarm) => {
//     return {
//       alarm,
//       user: {
//         ...session.user,
//       },
//     };
//   });
// };

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

      const updatedHour = typeof hour === "string" ? Number(hour) : hour;
      const updatedMinutes =
        typeof minutes === "string" ? Number(minutes) : minutes;

      if (!alarmlistId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please select an alarmlist.",
        });

      return ctx.db.alarm.create({
        data: {
          name: name || "Alarm",
          hour: updatedHour,
          minutes: updatedMinutes,
          meridiem,
          repeat,
          snooze,
          isOn: true,
          alarmlistId,
          userId,
        },
      });
    }),
  update: protectedProcedure
    .input(updateAlarmSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, hour, minutes, meridiem, repeat, snooze, alarmlistId } =
        input;

      const alarmlist = await ctx.db.alarmlist.findFirst({
        where: {
          id: alarmlistId,
        },
      });
      const updatedHour = typeof hour === "string" ? Number(hour) : hour;
      const updatedMinutes =
        typeof minutes === "string" ? Number(minutes) : minutes;

      if (!alarmlist) throw new TRPCError({ code: "NOT_FOUND" });

      const alarm = ctx.db.alarm.update({
        where: { id },
        data: {
          name: name || "Alarm",
          hour: updatedHour,
          minutes: updatedMinutes,
          meridiem,
          repeat,
          snooze,
          isOn: true,
          alarmlistId,
        },
      });

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
});
