import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const interactionRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).optional().default(10),
      })
    )
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      return await ctx.prisma.interaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        include: {
          contact: true,
          type: true,
        },
      });
    }),

  getAllByContactId: protectedProcedure
    .input(
      z.object({
        contactId: z.string().uuid(),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.prisma.interaction.findMany({
        where: { userId, contactId: input.contactId },
        orderBy: { date: 'desc' },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        notes: z.string().max(250).optional(),
        contactId: z.string().uuid(),
        typeId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { contactId, typeId, ...rest } = input;

      const interactionType = await ctx.prisma.interactionType.findFirst({
        where: { id: typeId, OR: [{ userId }, { userId: null }] },
      });
      if (!interactionType)
        throw new Error(`Interaction type with id ${typeId} does not exist`);

      const contact = await ctx.prisma.contact.findFirst({
        where: { id: contactId, userId },
        include: {
          interactions: {
            include: {
              type: true,
            },
          },
        },
      });
      if (!contact)
        throw new Error(`Contact with id ${contactId} does not exist`);

      const interaction = await ctx.prisma.interaction.create({
        data: {
          ...rest,
          contact: { connect: { id: contactId } },
          type: { connect: { id: typeId } },
          user: { connect: { id: userId } },
        },
      });

      const lastInteraction = contact.interactions.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      )[0];

      await ctx.prisma.contact.update({
        where: { id: contactId },
        data: {
          lastInteraction: lastInteraction?.date,
          lastInteractionType:
            lastInteraction && lastInteraction.type
              ? lastInteraction.type.name
              : undefined,
        },
      });

      return interaction;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        date: z.date(),
        notes: z.string().max(250).optional(),
        typeId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...rest } = input;

      const interactionToUpdate = await ctx.prisma.interaction.findFirst({
        where: { id, userId },
      });
      if (!interactionToUpdate)
        throw new Error(`Interaction with id ${id} does not exist`);

      const interactionType = await ctx.prisma.interactionType.findFirst({
        where: { id: input.typeId, userId },
      });
      if (!interactionType)
        throw new Error(
          `Interaction type with id ${input.typeId} does not exist`
        );

      const interaction = await ctx.prisma.interaction.update({
        where: { id },
        data: {
          ...rest,
        },
      });

      const contact = await ctx.prisma.contact.findFirst({
        where: { id: interaction.contactId, userId },
        include: {
          interactions: {
            include: {
              type: true,
            },
          },
        },
      });
      if (!contact)
        throw new Error(
          `Contact with id ${interaction.contactId} does not exist`
        );

      const lastInteraction = contact.interactions.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      )[0];

      await ctx.prisma.contact.update({
        where: { id: interaction.contactId },
        data: {
          lastInteraction: lastInteraction?.date,
          lastInteractionType:
            lastInteraction && lastInteraction.type
              ? lastInteraction.type.name
              : undefined,
        },
      });

      return interaction;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id } = input;

      const interactionToDelete = await ctx.prisma.interaction.findFirst({
        where: { id, userId },
      });
      if (!interactionToDelete)
        throw new Error(`Interaction with id ${id} does not exist`);

      const contact = await ctx.prisma.contact.findFirst({
        where: { id: interactionToDelete.contactId, userId },
        include: {
          interactions: {
            include: {
              type: true,
            },
          },
        },
      });
      if (!contact)
        throw new Error(
          `Contact with id ${interactionToDelete.contactId} does not exist`
        );

      const interaction = await ctx.prisma.interaction.delete({
        where: { id },
      });

      const lastInteraction = contact.interactions.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      )[0];

      await ctx.prisma.contact.update({
        where: { id: interaction.contactId },
        data: {
          lastInteraction: lastInteraction?.date,
          lastInteractionType:
            lastInteraction && lastInteraction.type
              ? lastInteraction.type.name
              : undefined,
        },
      });

      return interaction;
    }),
});
