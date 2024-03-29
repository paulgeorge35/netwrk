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
        config: {
          include: {
            timezone: true,
          },
        },
      },
    });
    return user;
  }),

  init: protectedProcedure
    .input(
      z.object({
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: {
          config: true,
        },
      });

      if (!user) throw new Error(`User with id ${userId} does not exist`);

      if (!user.config) {
        const timezone = await ctx.prisma.timezone.findFirst({
          where: {
            nameShort: input.timezone,
          },
        });
        console.log(timezone);
        return await ctx.prisma.config.create({
          data: {
            user: { connect: { id: userId } },
            timezone: { connect: { id: timezone?.id } },
          },
        });
      }
      return user.config;
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
        timezoneId: z.number().optional(),
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
            },
          },
        },
      });
      return user;
    }),
  search: protectedProcedure
    .input(z.string().optional().default(''))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input !== '') {
        console.log('SEARCH: ', input);
        return await ctx.prisma.contact
          .findMany({
            where: {
              userId,
              OR: [
                { fullName: { contains: input } },
                { phone: { contains: input } },
                { email: { contains: input } },
                { notes: { contains: input } },
                {
                  interactions: {
                    some: {
                      notes: { contains: input },
                    },
                  },
                },
              ],
            },
            include: {
              interactions: {
                include: {
                  type: true,
                },
              },
            },
          })
          .then((contacts) =>
            contacts.map((contact) => ({
              ...contact,
              interactions: contact.interactions.filter(
                (interaction) =>
                  interaction.notes &&
                  interaction.notes.toLowerCase().includes(input.toLowerCase())
              ),
            }))
          );
      }
      return [];
    }),
});
