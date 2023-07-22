import { type NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { api } from '@/utils/api';

import { Sidebar } from '@/components/sidebar';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/react-hook-form/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Contact, Group } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import emojis from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/columns';
import { AddContactSheet } from '@/components/sheet-add-contact';
import { AlertDestructive } from '@/components/alert-destructive';
import { useToast } from '@/components/ui/use-toast';
import { AddContactToGroupDialog } from '@/components/dialog-add-contact-to-group';
import { SheetContext } from '@/contexts/SheetContext';
import { useContext } from 'react';

const groupUpdateSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(20, { message: 'Name must be less than 20 characters' }),
  description: z.string().max(250).optional().default(''),
  icon: z.string({ required_error: 'Icon is required' }).emoji().min(1).max(20),
});

type GroupUpdateValues = z.infer<typeof groupUpdateSchema>;

const GroupPage: NextPage = (_) => {
  const router = useRouter();

  if (!router.query.id || typeof router.query.id !== 'string')
    return <h1>404 - Page Not Found</h1>;

  const { data: group, status } = api.group.getOne.useQuery(router.query.id, {
    queryKey: ['group.getOne', router.query.id],
    _optimisticResults: 'optimistic',
  });

  if (!group && status === 'error') return <h1>404 - Page Not Found</h1>;

  if (status === 'loading')
    return (
      <>
        <Head>
          <title>MyNetwrk</title>
          <meta name="description" content="MyNetwrk" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="grid min-h-screen bg-background lg:grid-cols-5">
          <Sidebar className="hidden lg:block" />
          <div className="col-span-3 px-4 text-secondary-foreground lg:col-span-4 lg:border-l">
            <div className="pt-4">
              <div className="flex flex-col justify-center gap-2">
                <span className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 font-normal" />
                  <Skeleton className="h-8 w-full max-w-sm font-normal" />
                </span>
                <Skeleton className="h-8 w-full max-w-md font-normal" />
              </div>
            </div>
          </div>
        </main>
      </>
    );

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
        <div className="col-span-3 px-4 text-secondary-foreground lg:col-span-4 lg:border-l">
          {group && <GroupHeader key={group.id} {...group} />}
          <GroupBody group={group} />
        </div>
      </main>
    </>
  );
};

export default GroupPage;

const GroupBody = ({
  group,
}: {
  group: Group & {
    contacts: Contact[];
  };
}) => {
  const { contact } = useContext(SheetContext);
  return (
    <DataTable
      data={group.contacts}
      columns={columns}
      onRowClick={(id: string) => contact.setId(id)}
    />
  );
};

type GroupHeaderProps = Group;

function GroupHeader({ ...group }: GroupHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: updateGroup } = api.group.update.useMutation({
    mutationKey: ['group.update', group.id],
  });
  const { mutate: deleteGroup } = api.group.delete.useMutation({
    mutationKey: ['group.delete', group.id],
  });

  const form = useForm<GroupUpdateValues>({
    resolver: zodResolver(groupUpdateSchema),
    mode: 'onBlur',
    defaultValues: {
      icon: group.icon,
      name: group.name,
      description: group.description ?? '',
    },
  });

  const ctx = api.useContext();

  const onSubmit = (data: GroupUpdateValues) => {
    updateGroup(
      { id: group.id, ...data },
      {
        onSuccess: () => {
          void ctx.group.getOne.invalidate(group.id);
          void ctx.group.getAll.invalidate();
        },
      }
    );
  };

  return (
    <span className="flex items-center justify-between gap-2">
      <form
        className="flex flex-col gap-1 pt-3"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <span className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Input
                        type="button"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-dashed border-transparent text-sm font-medium shadow-none transition-colors hover:border-blue-600 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring  disabled:pointer-events-none disabled:opacity-50"
                        {...field}
                      />
                    </PopoverTrigger>
                    <span className="sr-only">Open popover</span>
                    <PopoverContent side="right" className="w-80 p-0">
                      <Picker
                        data={emojis}
                        onEmojiSelect={(emoji: { native: string }) =>
                          form.setValue('icon', emoji.native)
                        }
                        onClickOutside={form.handleSubmit(onSubmit)}
                        theme="auto"
                        maxFrequentRows={1}
                        navPosition="none"
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="flex max-w-xs items-center justify-center rounded-lg border-transparent text-2xl font-bold shadow-none hover:border-dashed hover:border-input focus-visible:border-dashed focus-visible:border-input focus-visible:shadow-none focus-visible:ring-0"
                    {...field}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onBlur={form.handleSubmit(onSubmit)}
                    onKeyDown={(e) => e.code === 'Enter' && e.preventDefault()}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </span>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Write a short description of this group here"
                  className="flex max-w-md items-center justify-center rounded-lg border-transparent text-sm text-gray-500 shadow-none hover:border-dashed hover:border-input focus-visible:border-dashed focus-visible:border-input focus-visible:shadow-none focus-visible:ring-0"
                  {...field}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onBlur={form.handleSubmit(onSubmit)}
                  onKeyDown={(e) => e.code === 'Enter' && e.preventDefault()}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
      <span className="flex gap-4">
        <AddContactToGroupDialog defaultGroup={group.id} />
        <AddContactSheet defaultGroup={group.id} />
        <AlertDestructive
          description="This action cannot be undone. This will permanently delete this group and remove the data from our servers"
          button="Delete Group"
          action={() =>
            deleteGroup(group.id, {
              onSuccess: () => {
                toast({
                  title: '✅ Success',
                  description: `Group deleted successfully!`,
                });
                void ctx.group.getAll.invalidate();
                void router.push('/');
              },
            })
          }
        />
      </span>
    </span>
  );
}
