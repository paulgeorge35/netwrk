import { type NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'

import { Sidebar } from '@/components/sidebar'

const Interactions: NextPage = (_) => {
  const session = useSession()
  return (
    <>
      <Head>
        <title>Interactions</title>
        <meta name="description" content="MyNetwrk - Interactions page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen bg-background lg:grid-cols-5">
        <Sidebar className="hidden lg:block" userId={session.data?.user.id} />
        <div className="text-secondary-foreground col-span-3 lg:col-span-4 lg:border-l"></div>
      </main>
    </>
  )
}

export default Interactions
