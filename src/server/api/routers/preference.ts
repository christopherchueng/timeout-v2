import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const preferenceRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    let preferences = await ctx.db.preference.findFirst({
      where: { userId: ctx.session.user.id },
    });

    if (!preferences) {
      preferences = await ctx.db.preference.create({
        data: {
          userId: ctx.session.user.id,
          use12Hour: true,
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
