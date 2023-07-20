import { type NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { Sidebar } from '@/components/sidebar';
import { AddContactSheet } from '@/components/sheet-add-contact';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/columns';
import { api } from '@/utils/api';

const Home: NextPage = (_) => {
  const { data: contacts } = api.contact.getAll.useQuery(
    {},
    {
      queryKey: ['contact.getAll', {}],
      _optimisticResults: 'optimistic',
    }
  );
  const session = useSession();
  return (
    <>
      <Head>
        <title>My Netwrk</title>
        <meta name="description" content="MyNetwrk - Manage your contacts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen bg-background lg:grid-cols-5">
        <Sidebar className="hidden lg:block" userId={session.data?.user.id} />
        <div className="col-span-3 px-4 text-secondary-foreground lg:col-span-4 lg:border-l">
          <span className="flex items-center justify-between gap-2">
            <span className="flex flex-col gap-1 pt-4">
              <span className="flex items-center gap-6">
                <h1>👩‍💻</h1>
                <h1 className="flex max-w-xs items-center justify-center rounded-lg border-transparent py-2 text-2xl font-bold shadow-none">
                  All People
                </h1>
              </span>
              <h1 className="flex max-w-md items-center justify-center rounded-lg border-transparent py-1 text-sm text-gray-500 shadow-none">
                A group of all the people in your network
              </h1>
            </span>
            <AddContactSheet />
          </span>
          {contacts && <DataTable data={contacts} columns={columns} />}
        </div>
      </main>
    </>
  );
};

export default Home;
