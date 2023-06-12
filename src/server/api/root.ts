import { contactRouter } from './routers/contact'
import { groupRouter } from './routers/group'
import { createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  group: groupRouter,
  contact: contactRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
