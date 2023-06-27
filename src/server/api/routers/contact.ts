import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const contactRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      return await ctx.prisma.contact.findMany({
        where: { userId },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      })
    }),

  getAllByGroupId: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.contact.findMany({
        where: { userId, groups: { some: { id: input.groupId } } },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        fullName: z.string().max(50),
        firstMet: z.date(),
        notes: z.string().max(250).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        groups: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { groups, ...rest } = input
      groups?.forEach((id) => {
        void (async () => {
          const group = await ctx.prisma.group.findUnique({ where: { id } })
          if (!group) throw new Error(`Group with id ${id} does not exist`)
        })()
      })
      const contact = await ctx.prisma.contact.create({
        data: {
          ...rest,
          userId,
          groups: { connect: groups?.map((id) => ({ id })) },
        },
      })
      return contact
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        fullName: z.string().max(50).optional(),
        firstMet: z.date().optional(),
        notes: z.string().max(250).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        groups: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, groups, ...rest } = input
      groups?.forEach((id) => {
        void (async () => {
          const group = await ctx.prisma.group.findUnique({ where: { id } })
          if (!group) throw new Error(`Group with id ${id} does not exist`)
        })()
      })
      const contact = await ctx.prisma.contact.update({
        where: { id },
        data: {
          ...rest,
          userId,
          groups: { set: groups?.map((id) => ({ id })) },
        },
      })
      return contact
    }),
})
