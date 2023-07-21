import { type NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { Sidebar } from '@/components/sidebar';
import { AddInteractionSheet } from '@/components/sheet-add-interaction';
import { PageHeader } from '@/components/page-header';

const Interactions: NextPage = (_) => {
  const session = useSession();
  return (
    <>
      <Head>
        <title>Interactions</title>
        <meta name="description" content="MyNetwrk - Interactions page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen bg-background lg:grid-cols-5">
        <Sidebar className="hidden lg:block" userId={session.data?.user.id} />
        <div className="col-span-3 px-4 text-secondary-foreground lg:col-span-4 lg:border-l">
          <span className="flex items-center justify-between gap-2">
            <PageHeader
              icon="⏰"
              title="Interactions"
              subtitle="All of your Interactions"
            />
            <AddInteractionSheet />
          </span>
        </div>
      </main>
    </>
  );
};

export default Interactions;
