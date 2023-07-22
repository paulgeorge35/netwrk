import { api } from '@/utils/api';
import { Sheet, SheetContent } from './ui/sheet';
import { type ChangeEvent, useRef, useState } from 'react';
import { cn, fileToBase64 } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar } from './ui/avatar';
import Image from 'next/image';
import { Button } from './ui/button';
import { CalendarIcon, FileImage, Plus, X } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from './react-hook-form/form';
import { Input } from './ui/input';
import { Chip } from './ui/chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Textarea } from './ui/textarea';
import { InteractionCard } from './interaction-card';
import { ShortcutKeys } from './ui/shortcut-key';

const personUpdateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().max(50),
  firstMet: z.date().optional(),
  avatar: z.string().optional(),
  notes: z.string().max(1500).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  groups: z.array(z.string().uuid()).optional(),
});

type PersonUpdateValues = z.infer<typeof personUpdateSchema>;

export const ContactSheet = ({
  id,
  open,
  onOpenChange,
}: {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { toast } = useToast();
  const hiddenFileInput = useRef<null | HTMLInputElement>(null);

  const { data: contact } = api.contact.getById.useQuery(
    {
      id: id || '',
    },
    {
      enabled: !!id,
      _optimisticResults: 'optimistic',
      queryKey: ['contact.getById', { id: id || '' }],
    }
  );
  const { mutate: updateContact } = api.contact.update.useMutation();

  const { data: groups } = api.group.getAll.useQuery(undefined, {
    enabled: id !== undefined,
    queryKey: ['group.getAll', undefined],
    _optimisticResults: 'optimistic',
  });

  const [selectedGroups, setSelectedGroups] = useState<string[]>([
    ...(contact?.groups.map((group) => group.id) ?? []),
  ]);
  const [avatar, setAvatar] = useState<string | null>(contact?.avatar ?? null);

  const form = useForm<PersonUpdateValues>({
    resolver: zodResolver(personUpdateSchema),
    defaultValues: {
      id: contact?.id,
      fullName: contact?.fullName,
      firstMet: contact?.firstMet ?? undefined,
      avatar: contact?.avatar ?? undefined,
      notes: contact?.notes ?? undefined,
      email: contact?.email ?? undefined,
      phone: contact?.phone ?? undefined,
      groups: contact?.groups.map((group) => group.id) ?? undefined,
    },
  });
  const ctx = api.useContext();

  const onSubmit = (data: PersonUpdateValues) => {
    updateContact(
      { ...data },
      {
        onSuccess: () => {
          form.reset();
          void ctx.contact.getById.invalidate({ id: data.id });
        },
        onError: (err) => {
          toast({
            title: '❌ Error',
            description: `Error creating contact: ${err.message}`,
          });
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        noPadding
        noCloseButton
        className="flex h-screen overflow-y-auto"
      >
        <span className="flex flex-col p-6">
          <input
            type="file"
            name="avatar"
            ref={hiddenFileInput}
            onChange={(
              e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              const files = (e.target as HTMLInputElement).files;
              if (files && files[0]) {
                fileToBase64(files[0], (base64) => {
                  if (typeof base64 === 'string') {
                    setAvatar(base64);
                    form.setValue('avatar', base64);
                  }
                });
              }
            }}
            className="hidden"
          />
          <form
            className="flex flex-col justify-between gap-4 py-4"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <span className="flex flex-col justify-between gap-4 ">
              <span className="flex justify-center">
                {avatar ? (
                  <span className="relative">
                    <Avatar className="h-24 w-24">
                      <Image
                        alt="Profile Picture"
                        width={96}
                        height={96}
                        src={avatar}
                      />
                    </Avatar>
                    <Button
                      className="absolute left-0 top-0 z-50 h-24 w-24 rounded-full opacity-0 hover:opacity-50"
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        form.resetField('avatar');
                        setAvatar(null);
                        if (hiddenFileInput.current)
                          hiddenFileInput.current.value = '';
                      }}
                    >
                      <X className="h-12 w-12" />
                    </Button>
                  </span>
                ) : (
                  <Button
                    className="h-24 w-24 rounded-full"
                    type="button"
                    variant="outline"
                    onClick={() => hiddenFileInput.current?.click()}
                  >
                    <FileImage className="h-12 w-12" />
                  </Button>
                )}
              </span>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <span className="block gap-2">
                <FormLabel className="mb-3 block">Groups</FormLabel>
                {groups &&
                  groups
                    .filter((group) => selectedGroups.includes(group.id))
                    .map((group) => (
                      <Chip
                        key={group.id}
                        className="mb-2 mr-2 inline-block"
                        action={(id: string) => {
                          setSelectedGroups([
                            ...selectedGroups.filter(
                              (groupId) => groupId !== id
                            ),
                          ]);
                          form.setValue('groups', [
                            ...selectedGroups.filter(
                              (groupId) => groupId !== id
                            ),
                          ]);
                        }}
                        {...group}
                      />
                    ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="inline-block h-8 rounded-full border-dashed py-1 text-xs font-light hover:border-blue-500 hover:bg-transparent"
                      variant="outline"
                    >
                      <Plus className="mr-2 inline-block h-3 w-3" />
                      Add to Group
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-36">
                    {groups &&
                      groups
                        .filter((group) => !selectedGroups.includes(group.id))
                        .map((group) => {
                          return (
                            <DropdownMenuItem
                              key={group.id}
                              onClick={() => {
                                setSelectedGroups([
                                  ...selectedGroups.filter(
                                    (groupId) => groupId !== group.id
                                  ),
                                  group.id,
                                ]);
                                form.setValue('groups', [
                                  ...selectedGroups.filter(
                                    (groupId) => groupId !== group.id
                                  ),
                                  group.id,
                                ]);
                              }}
                            >
                              <span>
                                {group.icon} {group.name}
                              </span>
                            </DropdownMenuItem>
                          );
                        })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
              <FormField
                control={form.control}
                name="firstMet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Met</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-[280px] justify-start text-left font-normal',
                              !form.getValues().firstMet &&
                                'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.getValues().firstMet ? (
                              format(form.getValues().firstMet as Date, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            {...field}
                            mode="single"
                            selected={form.getValues().firstMet}
                            onSelect={(date) => form.setValue('firstMet', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </span>
          </form>
        </span>
        <span className="flex h-screen w-full flex-col gap-4 bg-muted p-6">
          <span className="flex justify-end gap-2">
            <Button className="flex gap-2">
              Log Interaction <ShortcutKeys square shortcut="I" />
            </Button>
          </span>
          {contact &&
            contact.interactions.map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={{
                  ...interaction,
                  contact,
                }}
                editable
                solo
              />
            ))}
          {contact && contact.interactions.length === 0 && (
            <span className="flex h-full grow flex-col items-center justify-center gap-2">
              <Image
                alt="No results"
                width={64}
                height={64}
                src="/no-results.png"
              />
              <h1 className="text-lg">No interactions found</h1>
            </span>
          )}
        </span>
      </SheetContent>
    </Sheet>
  );
};
