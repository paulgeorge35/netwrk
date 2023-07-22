import { type NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { Sidebar } from '@/components/sidebar';
import { AddInteractionSheet } from '@/components/sheet-add-interaction';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { InteractionType, Contact } from '@prisma/client';
import { api } from '@/utils/api';
import { format } from 'date-fns';
import React from 'react';
import { compareDates } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { Command, CommandInput } from '@/components/ui/command';
import { highlightText } from '@/lib/helper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Interactions: NextPage = (_) => {
  const session = useSession();
  const [search, setSearch] = React.useState('');
  const { data: interactions } = api.interaction.getAll.useQuery(
    {},
    {
      queryKey: ['interaction.getAll', {}],
    }
  );
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
          <Command className="my-4 h-12 max-w-[500px]  border">
            <CommandInput
              value={search}
              className="h-12"
              placeholder="Search interaction"
              onValueChange={setSearch}
            />
          </Command>

          <span className="flex max-w-[500px] flex-col gap-4">
            {interactions && interactions.length > 0 ? (
              interactions
                .filter(
                  (interaction) =>
                    interaction.notes
                      ?.toLowerCase()
                      .includes(search.toLowerCase()) ||
                    interaction.contact.fullName
                      .toLowerCase()
                      .includes(search.toLowerCase())
                )
                .map(
                  (interaction) =>
                    new Date(
                      interaction.date.getFullYear(),
                      interaction.date.getMonth(),
                      interaction.date.getDate()
                    )
                )
                .filter(
                  (date, index, self) =>
                    self.findIndex((d) => d.getTime() === date.getTime()) ===
                    index
                )
                .map((date) => {
                  return (
                    <span key={date.getTime()} className="flex flex-col gap-4">
                      <h1>{format(date, 'MMM dd, yyyy')}</h1>
                      {interactions
                        .filter(
                          (interaction) =>
                            interaction.notes
                              ?.toLowerCase()
                              .includes(search.toLowerCase()) ||
                            interaction.contact.fullName
                              .toLowerCase()
                              .includes(search.toLowerCase())
                        )
                        .filter((int) => compareDates(date, int.date))
                        .map((int) => (
                          <InteractionCard
                            key={int.id}
                            {...int}
                            search={search}
                          />
                        ))}
                    </span>
                  );
                })
            ) : (
              <h1>No interactions found.</h1>
            )}
          </span>
        </div>
      </main>
    </>
  );
};

export default Interactions;

const InteractionCard = ({
  type,
  contact,
  notes,
  search,
}: {
  id: string;
  type: InteractionType;
  contact: Contact;
  date: Date;
  notes: string | null;
  search: string;
}) => {
  return (
    <Card>
      <CardHeader className="relative flex flex-row justify-between p-4">
        <div className="flex items-baseline gap-2 text-sm font-semibold leading-none tracking-tight">
          <Avatar className="h-5 w-5 items-center justify-center bg-muted">
            <AvatarImage src={contact.avatar ?? undefined} />
            <AvatarFallback>
              {`${contact.fullName}`
                .split(' ')
                .map((n) => n[0])
                .filter((_, index) => index < 1)
                .join('')}
            </AvatarFallback>
          </Avatar>
          <h1>{highlightText(contact.fullName, search)}</h1>
          {' · '}
          <h1 className="font-medium text-muted-foreground">{type.name}</h1>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2 h-6 w-6"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <h1 className="font-light">{notes && highlightText(notes, search)}</h1>
      </CardContent>
    </Card>
  );
};
