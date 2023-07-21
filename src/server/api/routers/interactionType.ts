import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const interactioTypeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await ctx.prisma.interactionType.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }),

  create: protectedProcedure
    .input(z.string().min(3).max(25))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.prisma.interactionType.create({
        data: {
          name: input,
          userId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(3).max(25),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, name } = input;

      return await ctx.prisma.interactionType.update({
        where: { id },
        data: {
          name,
          userId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input: id }) => {
      const userId = ctx.session.user.id;
      const interactionType = await ctx.prisma.interactionType.findFirst({
        where: { id, userId },
      });
      if (!interactionType) throw new Error('Interaction type not found');

      return await ctx.prisma.interactionType.delete({
        where: { id },
      });
    }),
});
