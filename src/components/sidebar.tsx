import { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '@/utils/api';
import Picker from '@emoji-mart/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { Separator } from '@radix-ui/react-separator';
import { Bookmark, Plus, Search, Settings, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import emojis from '@emoji-mart/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './react-hook-form/form';
import { Avatar, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useToast } from './ui/use-toast';
import { ShortcutKeys } from './ui/shortcut-key';
import { useHotkeys } from 'react-hotkeys-hook';
import { highlightText } from '@/lib/helper';
import type { Contact, Interaction, InteractionType } from '@prisma/client';
import { Card, CardContent, CardHeader } from './ui/card';
import { InteractionCard } from './interaction-card';
import { ContactSheet } from './sheet-contact';
import { SheetContext } from '@/contexts/SheetContext';

const groupFormSchema = z.object({
  icon: z.string({
    required_error: 'Icon is required.',
    invalid_type_error: 'Icon format is not valid.',
  }),
  name: z
    .string({
      required_error: 'Name is required.',
    })
    .max(16, {
      message: 'Name must be at most 16 characters.',
    }),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

const defaultValues: GroupFormValues = {
  icon: '🏡',
  name: '',
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  userId?: string;
  contact?: string;
  setContact?: (contact?: string) => void;
}

export function Sidebar({ className }: SidebarProps) {
  const session = useSession();
  const { toast } = useToast();
  const [search, setSearch] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [contactIndex, setContactIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { data } = useSession();
  const { contact } = useContext(SheetContext);

  const { data: searchResults } = api.user.search.useQuery(search, {
    enabled: search.length > 0,
    _optimisticResults: 'optimistic',
    queryKey: ['user.search', search],
  });

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues,
    mode: 'onSubmit',
    shouldFocusError: true,
  });

  const authSession = useSession();
  if (authSession.status === 'unauthenticated') void router.push('/sign-in');

  const ctx = api.useContext();
  const { mutate, isLoading: isCreatingGroup } = api.group.create.useMutation();
  const onSubmit = (data: GroupFormValues) => {
    mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast({
          title: '✅ Success',
          description: `Group ${data.name} created successfully!`,
        });
        void ctx.group.getAll.invalidate();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };

  useHotkeys('mod+/', () => {
    setIsSearchOpen(true);
  });

  const navigateTo = (path: string) => {
    router.push(path).catch((err) => console.error(err));
  };

  const {
    data: groups,
    refetch,
    isLoading: isLoadingGroups,
  } = api.group.getAll.useQuery(undefined, {
    enabled: false,
  });

  useEffect(() => {
    if (session) void refetch();
  }, [session, refetch]);

  return (
    <div className={cn('pb-12', className)}>
      {contact.id && (
        <ContactSheet
          id={contact.id}
          open={contact.isOpen}
          onOpenChange={contact.setIsOpen}
        />
      )}
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link href="/">
            <h1 className="text-xl font-semibold tracking-tight">MyNetwrk</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Avatar>
              {data?.user && (
                <Image
                  src={data.user.image || ''}
                  alt={`@${data.user.name || 'Avatar'}`}
                  width={48}
                  height={48}
                />
              )}
              <AvatarFallback>
                <Skeleton className="h-12 w-12 rounded-full" />
              </AvatarFallback>
            </Avatar>
            <Separator
              orientation="horizontal"
              className="my-6 flex-1 border-[1px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSearchOpen(true)}
              size="sm"
              className="w-full justify-between"
            >
              <span className="flex justify-start">
                <Search className="mr-2 h-4 w-4" />
                Search
              </span>
              {/* <ShortcutKeys square shortcut="⌘ + /" /> */}
              <span className="flex gap-1">
                <ShortcutKeys square shortcut="⌘" />
                <ShortcutKeys square shortcut="/" />
              </span>
            </Button>
            <Button
              type="button"
              variant={router.pathname === '/settings' ? 'secondary' : 'ghost'}
              onClick={() => navigateTo('/settings')}
              size="sm"
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            {/* <Button
              type="button"
              variant={router.pathname === '/reminders' ? 'secondary' : 'ghost'}
              onClick={() => navigateTo('/reminders')}
              size="sm"
              className="w-full justify-start"
            >
              <Clock className="mr-2 h-4 w-4" />
              Reminders
            </Button> */}
            <Button
              type="button"
              variant={
                router.pathname === '/interactions' ? 'secondary' : 'ghost'
              }
              onClick={() => navigateTo('/interactions')}
              size="sm"
              className="w-full justify-start"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Interactions
            </Button>
            <Button
              type="button"
              variant={router.pathname === '/' ? 'secondary' : 'ghost'}
              onClick={() => navigateTo('/')}
              size="sm"
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              All People
            </Button>
          </div>
        </div>
        <div className="py-2">
          <div className="flex w-full items-center justify-between px-6 pr-4">
            <h2 className="relative text-lg font-semibold tracking-tight">
              Groups
            </h2>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open: boolean) => setIsDialogOpen(open)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className=" mr-2 h-4 w-4 p-0"
                >
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Add Group</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>New Group</DialogTitle>
                  <DialogDescription className="my-1 rounded-xl bg-secondary p-4 text-secondary-foreground">
                    {`💡 Groups allow you to "group" people together for quick
                    access. You can create a group for "close friends", "work
                    friends", "clients", etc...`}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Icon</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Input
                                  type="button"
                                  className="flex h-20 w-20 items-center justify-center rounded-lg border-dashed text-4xl hover:cursor-pointer hover:border-blue-600"
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
                                  theme="auto"
                                  maxFrequentRows={1}
                                  navPosition="none"
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button isLoading={isCreatingGroup} disabled={isLoading}>
                        Create Group
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="h-[300px] px-2">
            <div className="flex flex-col gap-1 p-2">
              {isLoadingGroups || !groups
                ? Array.from(Array(5)).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-8 w-full justify-between font-normal"
                    />
                  ))
                : groups.map((group, i) => (
                    <Button
                      key={`${group.id}-${i}`}
                      onClick={() => {
                        navigateTo(`/group/${group.id}`);
                      }}
                      variant={
                        group.id === router.query.id ? 'secondary' : 'ghost'
                      }
                      size="sm"
                      className="w-full justify-between font-normal"
                    >
                      <span className="mr-2">{group.icon}</span>
                      {group.name}
                      <span className="ml-auto text-xs font-semibold">
                        {group.count}
                      </span>
                    </Button>
                  ))}
            </div>
          </ScrollArea>
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogContent floating className="w-[800px] gap-0 lg:max-w-[50vw]">
              <Input
                search
                className="h-12 w-full"
                searchClassName={cn(
                  searchResults && searchResults.length > 0 && 'rounded-b-none'
                )}
                placeholder="Search through everything"
                value={search}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    searchResults &&
                      setContactIndex((i) => (i + 1) % searchResults.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    searchResults &&
                      setContactIndex(
                        (i) =>
                          (i - 1 + searchResults.length) % searchResults.length
                      );
                  }
                }}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setContactIndex(0);
                }}
              />
              {searchResults && searchResults.length > 0 && (
                <div className="flex h-[300px]">
                  <div className="flex h-full w-[50%] flex-col gap-1 overflow-auto">
                    {searchResults.map((contact, i) => (
                      <a
                        key={contact.id}
                        role="button"
                        className={cn(
                          'flex items-center justify-between p-2 hover:bg-muted',
                          contactIndex === i && 'bg-muted'
                        )}
                        onMouseOver={() => setContactIndex(i)}
                      >
                        <span className="flex items-center justify-start gap-2">
                          <Avatar className="h-5 w-5 items-center justify-center bg-muted">
                            <AvatarImage src={contact.avatar ?? undefined} />
                            <AvatarFallback className="text-center">
                              {/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */}
                              {`${contact.fullName}`.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <h1>{highlightText(contact.fullName, search)}</h1>
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {`${
                            contact.fullName
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            contact.email
                              ?.toLowerCase()
                              .includes(search.toLowerCase()) ||
                            contact.phone
                              ?.toLowerCase()
                              .includes(search.toLowerCase()) ||
                            contact.notes
                              ?.toLowerCase()
                              .includes(search.toLowerCase())
                              ? contact.interactions.length + 1
                              : contact.interactions.length
                          }
                          matches`}
                        </span>
                      </a>
                    ))}
                  </div>
                  <div className="flex h-full w-[50%] flex-col gap-1 overflow-y-auto bg-muted/50 p-3">
                    {searchResults && (
                      <SearchResults
                        contact={searchResults[contactIndex]}
                        search={search}
                        onContactClick={(id: string) => {
                          setIsSearchOpen(false);
                          contact.setId(id);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
type InteractionWithTypes = Interaction & { type: InteractionType };
type ContactWithInteractions = Contact & {
  interactions: InteractionWithTypes[];
};

const SearchResults = ({
  contact,
  search,
  onContactClick,
}: {
  contact: ContactWithInteractions | undefined;
  search: string;
  onContactClick: (id: string) => void;
}) => {
  if (!contact) return null;
  const matchesContact =
    contact.fullName.toLowerCase().includes(search.toLowerCase()) ||
    contact.email?.toLowerCase().includes(search.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(search.toLowerCase()) ||
    contact.notes?.toLowerCase().includes(search.toLowerCase());
  return (
    <span className="flex flex-col gap-3">
      {matchesContact && (
        <Card>
          <CardHeader className="relative flex flex-row justify-between p-4 pb-2">
            <div className="flex items-center gap-2 text-sm font-semibold leading-none tracking-tight">
              <Avatar className="h-5 w-5 items-center justify-center bg-muted">
                <AvatarImage src={contact.avatar ?? undefined} />
                <AvatarFallback>
                  {`${contact.fullName}`.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <a
                role="button"
                onClick={() => onContactClick(contact.id)}
                className="cursor-pointer"
              >
                {contact.fullName}
              </a>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 px-4 pb-4">
            <span
              className={cn(
                'text-sm text-muted-foreground underline underline-offset-4',
                !contact.fullName
                  .toLowerCase()
                  .includes(search.toLowerCase()) && 'hidden'
              )}
            >
              Name
            </span>
            <h1
              className={cn(
                'text-sm text-muted-foreground',
                !contact.fullName
                  .toLowerCase()
                  .includes(search.toLowerCase()) && 'hidden'
              )}
            >
              {highlightText(contact.fullName, search)}
            </h1>
            <span
              className={cn(
                'text-sm text-muted-foreground underline underline-offset-4',
                !contact.phone?.toLowerCase().includes(search.toLowerCase()) &&
                  'hidden'
              )}
            >
              Phone
            </span>
            <h1
              className={cn(
                'text-sm text-muted-foreground',
                !contact.phone?.toLowerCase().includes(search.toLowerCase()) &&
                  'hidden'
              )}
            >
              {contact.phone && highlightText(contact.phone, search)}
            </h1>
            <span
              className={cn(
                'text-sm text-muted-foreground underline underline-offset-4',
                !contact.email?.toLowerCase().includes(search.toLowerCase()) &&
                  'hidden'
              )}
            >
              Email
            </span>
            <h1
              className={cn(
                'text-sm text-muted-foreground',
                !contact.email?.toLowerCase().includes(search.toLowerCase()) &&
                  'hidden'
              )}
            >
              {contact.email && highlightText(contact.email, search)}
            </h1>
            <span
              className={cn(
                'text-sm text-muted-foreground underline underline-offset-4',
                !contact.notes?.toLowerCase().includes(search.toLowerCase()) &&
                  'hidden'
              )}
            >
              Notes
            </span>
            <h1
              className={cn(
                'text-sm text-muted-foreground',
                !contact.notes?.toLowerCase().includes(search.toLowerCase()) &&
                  'hidden'
              )}
            >
              {contact.notes && highlightText(contact.notes, search)}
            </h1>
          </CardContent>
        </Card>
      )}
      {contact.interactions.map((interaction) => (
        <InteractionCard
          key={interaction.id}
          interaction={{
            ...interaction,
            contact: { ...contact },
          }}
          search={search}
          solo
        />
      ))}
    </span>
  );
};
