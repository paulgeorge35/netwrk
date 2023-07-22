import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const contactRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).optional().default(10),
      })
    )
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      return await ctx.prisma.contact.findMany({
        where: { userId },
      });
    }),

  getAllByGroupId: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).optional().default(10),
        orderBy: z
          .enum(['fullName', 'lastInteraction', 'notes'])
          .optional()
          .default('fullName'),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.prisma.contact.findMany({
        where: { userId, groups: { some: { id: input.groupId } } },
        orderBy: { [input.orderBy]: 'asc' },
      });
    }),

  getAllNotInGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.prisma.contact.findMany({
        where: {
          userId,
          groups: { none: { id: input.groupId } },
          fullName: { contains: input.search },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        fullName: z.string().max(50),
        firstMet: z.date().optional(),
        avatar: z.string().max(10000).optional(),
        notes: z.string().max(250).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        groups: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { groups, ...rest } = input;
      groups?.forEach((id) => {
        void (async () => {
          const group = await ctx.prisma.group.findUnique({ where: { id } });
          if (!group) throw new Error(`Group with id ${id} does not exist`);
        })();
      });
      const contact = await ctx.prisma.contact.create({
        data: {
          ...rest,
          user: { connect: { id: userId } },
          groups: { connect: groups?.map((id) => ({ id })) },
        },
      });
      return contact;
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...rest } = input;

      const contact = await ctx.prisma.contact.findFirst({
        where: { id, userId },
      });
      if (!contact) throw new Error(`Contact with id ${id} does not exist`);

      return await ctx.prisma.contact.update({
        where: { id },
        data: {
          ...rest,
        },
      });
    }),

  addToGroup: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, groupId } = input;

      const contact = await ctx.prisma.contact.findFirst({
        where: { id, userId },
      });
      if (!contact) throw new Error(`Contact with id ${id} does not exist`);

      const group = await ctx.prisma.group.findFirst({
        where: { id: groupId, userId },
      });
      if (!group) throw new Error(`Group with id ${groupId} does not exist`);

      return await ctx.prisma.contact.update({
        where: { id },
        data: {
          groups: { connect: { id: groupId } },
        },
      });
    }),

  removeFromGroup: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, groupId } = input;

      const contactToBeUpdated = await ctx.prisma.contact.findFirst({
        where: { id, userId },
      });
      if (!contactToBeUpdated)
        throw new Error(`Contact with id ${id} does not exist`);

      const group = await ctx.prisma.group.findFirst({
        where: { id: groupId, userId },
      });
      if (!group) throw new Error(`Group with id ${groupId} does not exist`);

      return await ctx.prisma.contact.update({
        where: { id },
        data: {
          groups: { disconnect: { id: groupId } },
        },
      });
    }),
});
