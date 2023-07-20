import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        sessions: true,
        config: true,
      },
    });
    return user;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().max(20).optional(),
        email: z.string().email().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const user = await ctx.prisma.user.update({
        where: { id: userId },
        data: { ...input },
      });
      return user;
    }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        reminderEmails: z.boolean().optional(),
        keepInTouch: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const user = await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          config: {
            upsert: {
              create: input,
              update: input,
            }
          }
        },
      });
      return user;
    }),
});
