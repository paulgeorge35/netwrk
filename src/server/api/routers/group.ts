import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const groupRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const groups = await ctx.prisma.group.findMany({
      where: { userId },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
    });
    const result = await Promise.all(
      groups.map(({ _count, ...rest }) => ({
        ...rest,
        count: _count.contacts,
      }))
    ).then((groups) => groups.sort((a, b) => a.name.localeCompare(b.name)));
    return result;
  }),

  getOne: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input: id }) => {
      const userId = ctx.session.user.id;

      const group = await ctx.prisma.group.findFirst({
        where: { id, userId },
        include: {
          contacts: true,
        },
      });
      if (!group) throw new Error(`Group with id ${id} does not exist`);
      return group;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string({ required_error: 'Name is required' })
          .max(20, { message: 'Name must be less than 20 characters' })
          .transform((val) => val.trim())
          .transform((val) => (val === '' ? 'New Group' : val)),
        description: z.string().max(250).optional().nullable(),
        icon: z
          .string({ required_error: 'Icon is required' })
          .emoji()
          .max(20)
          .default('👥'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const group = await ctx.prisma.group.create({
        data: { ...input, userId },
      });
      return group;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z
          .string({ required_error: 'Name is required' })
          .min(3, { message: 'Name must be at least 3 characters' })
          .max(20, { message: 'Name must be less than 20 characters' }),
        description: z.string().max(250).optional().nullable(),
        icon: z
          .string({ required_error: 'Icon is required' })
          .emoji()
          .min(1)
          .max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...rest } = input;

      const group = await ctx.prisma.group.findFirst({
        where: { id, userId },
      });
      if (!group) throw new Error(`Group with id ${id} does not exist`);

      return await ctx.prisma.group.update({
        where: { id },
        data: rest,
      });
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input: id }) => {
      const userId = ctx.session.user.id;

      const group = await ctx.prisma.group.findFirst({
        where: { id, userId },
      });
      if (!group) throw new Error(`Group with id ${id} does not exist`);

      return await ctx.prisma.group.delete({
        where: { id },
      });
    }),

  addManyContacts: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        contactIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, contactIds } = input;

      const group = await ctx.prisma.group.findFirst({
        where: { id, userId },
      });
      if (!group) throw new Error(`Group with id ${id} does not exist`);

      const contacts = await ctx.prisma.contact.findMany({
        where: { id: { in: contactIds }, userId },
      });

      return await ctx.prisma.group.update({
        where: { id },
        data: { contacts: { connect: contacts.map(({ id }) => ({ id })) } },
      });
    }),

  getAllWithoutContact: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input: contactId }) => {
      const userId = ctx.session.user.id;

      return await ctx.prisma.group.findMany({
        where: { userId, contacts: { none: { id: contactId } } },
      });
    }),
});
