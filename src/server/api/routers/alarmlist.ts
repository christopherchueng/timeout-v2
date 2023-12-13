import { z } from "zod";

import type { Alarmlist } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getServerAuthSession } from "@/server/auth";
import { TRPCError } from "@trpc/server";

const addUserDataToAlarmlists = async (alarmlists: Alarmlist[]) => {
  const session = await getServerAuthSession();
  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User for alarmlist not found",
    });
  }
  return alarmlists.map((alarmlist) => {
    return {
      alarmlist,
      user: {
        ...session.user,
      },
    };
  });
};

export const alarmlistRouter = createTRPCRouter({
  getAlarmlistsByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.alarmlist.findMany({
        where: {
          userId: input.userId,
        },
        take: 10,
        orderBy: [{ createdAt: "desc" }],
      }),
    ),
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
          is_on: input.is_on,
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
});
