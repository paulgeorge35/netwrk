import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '../trpc'

export const groupRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const profileId = ctx.userId
    const groups = await ctx.prisma.group.findMany({
      where: { profileId },
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

  getOne: privateProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input: id }) => {
      const profileId = ctx.userId
      const group = await ctx.prisma.group.findFirst({
        where: { id, profileId },
      })
      if (!group) throw new Error(`Group with id ${id} does not exist`)
      return group
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string().max(20),
        description: z.string().max(250).optional(),
        icon: z.string().emoji().min(1).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profileId = ctx.userId
      const group = await ctx.prisma.group.create({
        data: { ...input, profileId },
      })
      return group
    }),
})
