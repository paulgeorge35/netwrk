import { type NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { Sidebar } from '@/components/sidebar';
import { AddContactSheet } from '@/components/sheet-add-contact';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/columns';
import { api } from '@/utils/api';
import { PageHeader } from '@/components/page-header';

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
            <PageHeader
              icon="👩‍💻"
              title="All People"
              subtitle="A group of all the people in your network"
            />
            <AddContactSheet />
          </span>
          {contacts && <DataTable data={contacts} columns={columns} />}
        </div>
      </main>
    </>
  );
};

export default Home;
