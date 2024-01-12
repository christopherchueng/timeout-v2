import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getServerAuthSession } from "@/server/auth";
import { TRPCError } from "@trpc/server";

export const preferenceRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const session = await getServerAuthSession();

    if (!session) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User not found",
      });
    }

    let preferences = await ctx.db.preference.findFirst({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      preferences = await ctx.db.preference.create({
        data: {
          userId: session.user.id,
          use12Hour: false,
        },
      });
    }

    return preferences;
  }),
  create: protectedProcedure
    .input(z.object({ userId: z.string(), isOn: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, isOn } = input;

      return await ctx.db.preference.create({
        data: { userId, use12Hour: isOn },
      });
    }),
  toggle: protectedProcedure
    .input(z.object({ userId: z.string(), isOn: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, isOn } = input;

      await ctx.db.preference.update({
        where: { userId },
        data: { use12Hour: isOn },
      });
    }),
});
