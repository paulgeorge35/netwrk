import { createTRPCRouter, protectedProcedure } from '../trpc';

export const timezoneRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.timezone.findMany();
  }),
});
