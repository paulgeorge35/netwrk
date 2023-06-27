import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const groupRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const groups = await ctx.prisma.group.findMany({
      where: { userId },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
    })
    const result = await Promise.all(
      groups.map(({ _count, ...rest }) => ({
        ...rest,
        count: _count.contacts,
      }))
    ).then((groups) => groups.sort((a, b) => a.name.localeCompare(b.name)))
    return result
  }),

  getOne: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input: id }) => {
      const userId = ctx.session.user.id

      const group = await ctx.prisma.group.findFirst({
        where: { id, userId },
      })
      if (!group) throw new Error(`Group with id ${id} does not exist`)
      return group
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().max(20),
        description: z.string().max(250).optional(),
        icon: z.string().emoji().min(1).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const group = await ctx.prisma.group.create({
        data: { ...input, userId },
      })
      return group
    }),
})
