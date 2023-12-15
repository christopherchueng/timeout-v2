import { z } from "zod";

import type { Alarmlist } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getServerAuthSession } from "@/server/auth";
import { TRPCError } from "@trpc/server";

const addUserDataToAlarmlist = async (alarmlist: Alarmlist) => {
  const session = await getServerAuthSession();
  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User for alarmlist not found",
    });
  }
  return {
    alarmlist,
    user: {
      ...session.user,
    },
  };
};

export const alarmlistRouter = createTRPCRouter({
  getAlarmlistsByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const alarmlistsWithAlarms = await ctx.db.alarmlist.findMany({
        where: {
          userId: input.userId,
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
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alarmlist.create({
        data: {
          name: input.name,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        is_on: z.boolean().optional(),
        name: z.string().min(1, { message: "Please enter a name." }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alarmlist.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          isOn: input.is_on,
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
  toggleAlarmlist: protectedProcedure
    .input(z.object({ id: z.string(), isOn: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const alarms = ctx.db.alarm.findMany({
        where: { alarmlistId: input.id },
      });
      const alarmlist = ctx.db.alarmlist.update({
        where: {
          id: input.id,
        },
        data: {
          isOn: true,
        },
      });

      (await alarms).map((alarm) => {
        ctx.db.alarm.update({
          where: {
            id: alarm.id,
          },
          data: {
            isOn: input.isOn,
          },
        });
      });

      return {
        alarmlist,
        alarms,
      };
    }),
});
