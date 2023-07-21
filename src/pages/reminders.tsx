import { type NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { Sidebar } from '@/components/sidebar';

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
            <span className="flex flex-col gap-1 pt-4">
              <span className="flex items-center gap-6">
                <h1>⏰</h1>
                <h1 className="flex max-w-xs items-center justify-center rounded-lg border-transparent py-2 text-2xl font-bold shadow-none">
                  Reminders
                </h1>
              </span>
              <h1 className="flex max-w-md items-center justify-center rounded-lg border-transparent py-1 text-sm text-gray-500 shadow-none">
                All of your Reminders
              </h1>
            </span>
            {/* <AddContactSheet /> */}
          </span>
        </div>
      </main>
    </>
  );
};

export default Reminders;
