import { type NextPage } from 'next'
import Head from 'next/head'
import { SignOutButton, useUser } from '@clerk/nextjs'

import { Sidebar } from '@/components/sidebar'

const Home: NextPage = (_) => {
  const user = useUser()
  return (
    <>
      <Head>
        <title>My Netwrk</title>
        <meta name="description" content="MyNetwrk - Manage your contacts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen bg-background lg:grid-cols-5">
        <Sidebar className="hidden lg:block" userId={user?.user?.id} />
        <div className="text-secondary-foreground col-span-3 lg:col-span-4 lg:border-l">
          {user.isSignedIn && <SignOutButton />}
        </div>
      </main>
    </>
  )
}

export default Home
