import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const groupRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const groups = await ctx.prisma.group.findMany();
    const result = await Promise.all(
      groups.map(async (group) => ({
        ...group,
        count: await ctx.prisma.contact.count({
          where: { groupId: group.id },
        }),
      }))
    ).then((groups) => groups.sort((a, b) => a.name.localeCompare(b.name)));
    return result;
  }),
});
