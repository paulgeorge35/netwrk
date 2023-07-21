import { type NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { Sidebar } from '@/components/sidebar';
import { PageHeader } from '@/components/page-header';

const Reminders: NextPage = (_) => {
  const session = useSession();
  return (
    <>
      <Head>
        <title>Reminders</title>
        <meta name="description" content="MyNetwrk - Reminders page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen bg-background lg:grid-cols-5">
        <Sidebar className="hidden lg:block" userId={session.data?.user.id} />
        <div className="col-span-3 px-4 text-secondary-foreground lg:col-span-4 lg:border-l">
          <span className="flex items-center justify-between gap-2">
            <PageHeader
              icon="⏰"
              title="Reminders"
              subtitle="All of your Reminders"
            />
            {/* <AddContactSheet /> */}
          </span>
        </div>
      </main>
    </>
  );
};

export default Reminders;
