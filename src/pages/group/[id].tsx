import { type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { api } from '@/utils/api'

import { Sidebar } from '@/components/sidebar'

const GroupPage: NextPage = (_) => {
  const router = useRouter()
  if (!router.query.id || typeof router.query.id !== 'string')
    return <h1>404 - Page Not Found</h1>

  const { data: group } = api.group.getOne.useQuery(router.query.id)

  if (!group) return <h1>404 - Page Not Found</h1>

  return (
    <>
      <Head>
        <title>{`${group.icon} ${group.name}`}</title>
        <meta
          name="description"
          content={`MyNetwrk - ${group.icon} ${group.name}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen bg-background lg:grid-cols-5">
        <Sidebar className="hidden lg:block" />
        <div className="text-secondary-foreground"></div>
      </main>
    </>
  )
}

export default GroupPage
