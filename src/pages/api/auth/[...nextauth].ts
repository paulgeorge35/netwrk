import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

const prisma = new PrismaClient()
const clientId = process.env.GITHUB_CLIENT_ID as string
const clientSecret = process.env.GITHUB_CLIENT_SECRET as string

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId,
      clientSecret,
    }),
  ],
})
