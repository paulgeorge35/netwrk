import { type NextPage } from 'next'
import Head from 'next/head'
import { useUser } from '@clerk/nextjs'

import { Sidebar } from '@/components/sidebar'

const Settings: NextPage = (_) => {
  const user = useUser()
  return (
    <>
      <Head>
        <title>Settings</title>
        <meta name="description" content="MyNetwrk - Settings page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen bg-background lg:grid-cols-5">
        <Sidebar className="hidden lg:block" userId={user?.user?.id} />
        <div className="text-secondary-foreground col-span-3 lg:col-span-4 lg:border-l"></div>
      </main>
    </>
  )
}

export default Settings
