import { type NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { Sidebar } from '@/components/sidebar';
import { AddContactSheet } from '@/components/sheet-add-contact';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/columns';
import { api } from '@/utils/api';
import { PageHeader } from '@/components/page-header';
import { SheetContext } from '@/contexts/SheetContext';
import { type Contact } from '@prisma/client';
import { useContext, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Home: NextPage = (_) => {
  const session = useSession();
  const { data: contacts, refetch } = api.contact.getAll.useQuery(undefined, {
    queryKey: ['contact.getAll', undefined],
    _optimisticResults: 'optimistic',
    enabled: false,
  });
  const { data: me } = api.user.me.useQuery();
  const { mutate: init } = api.user.init.useMutation();

  useEffect(() => {
    if (session) void refetch();
  }, [session, refetch]);

  useEffect(() => {
    if (me && !me.config)
      init({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
  }, [me, init]);
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
          {contacts && <HomeBody contacts={contacts} />}
          {!contacts && <Skeleton className="mt-4 h-[50vh] w-full" />}
        </div>
      </main>
    </>
  );
};
const HomeBody = ({ contacts }: { contacts: Contact[] }) => {
  const { contact } = useContext(SheetContext);
  return (
    <DataTable
      data={contacts}
      columns={columns}
      onRowClick={(id: string) => contact.setId(id)}
    />
  );
};

export default Home;
