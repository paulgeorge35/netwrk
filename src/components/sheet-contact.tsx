import { api } from '@/utils/api';
import { Sheet, SheetContent, SheetFooter } from './ui/sheet';
import { type ChangeEvent, useRef, useState } from 'react';
import { cn, fileToBase64 } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
import { useHotkeys } from 'react-hotkeys-hook';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardFooter } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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

const interactionCreateSchema = z.object({
  date: z.date(),
  notes: z.string().max(1500).optional(),
  typeId: z.string(),
  contactId: z.string(),
});

type InteractionCreateValues = z.infer<typeof interactionCreateSchema>;

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
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);
  const hiddenFileInput = useRef<null | HTMLInputElement>(null);

  const { data: contact, isLoading } = api.contact.getById.useQuery(
    {
      id: id || '',
    },
    {
      enabled: !!id,
      _optimisticResults: 'optimistic',
      queryKey: ['contact.getById', { id: id || '' }],
    }
  );
  const { mutate: updateContact, isLoading: isLoadingContact } =
    api.contact.update.useMutation();

  useHotkeys('i', () => {
    setIsAddingInteraction(true);
    setIsEditing(false);
  });

  useHotkeys('c', () => {
    setIsEditing(false);
    setIsAddingInteraction(false);
  });

  useHotkeys('e', () => {
    setIsAddingInteraction(false);
    setIsEditing(true);
  });

  useHotkeys('mod+enter', () => {
    if (isEditing) void form.handleSubmit(onSubmit)();
  });

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
          toast({
            title: '✅ Success',
            description: 'Contact updated successfully!',
          });
          setIsEditing(false);
        },
        onError: (err) => {
          toast({
            title: '❌ Error',
            description: `Error updating contact: ${err.message}`,
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
        <span className="flex w-full min-w-[250px] flex-col p-6">
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
          {isEditing ? (
            <form
              className="relative flex h-full flex-col justify-between gap-4 py-4"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <span className="flex flex-col justify-between gap-4 ">
                <span className="flex justify-center">
                  {avatar ? (
                    <span className="relative">
                      <Avatar className="h-24 w-24 bg-muted">
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
                    {groups &&
                      groups.filter(
                        (group) => !selectedGroups.includes(group.id)
                      ).length !== 0 && (
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="inline-block h-8 rounded-full border-dashed py-1 text-xs font-light hover:border-blue-500 hover:bg-transparent"
                            variant="outline"
                          >
                            <Plus className="mr-2 inline-block h-3 w-3" />
                            Add to Group
                          </Button>
                        </DropdownMenuTrigger>
                      )}
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
                              onSelect={(date) =>
                                form.setValue('firstMet', date)
                              }
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
              <SheetFooter>
                <span className="fixed bottom-4 flex gap-4">
                  <Button
                    variant="outline"
                    className="flex gap-2"
                    onClick={() => setIsEditing(false)}
                    isLoading={isLoadingContact}
                  >
                    Cancel
                    <ShortcutKeys square shortcut="C" />
                  </Button>
                  <Button
                    type="submit"
                    className="flex gap-2"
                    isLoading={isLoadingContact}
                  >
                    Save
                    <ShortcutKeys square shortcut="⌘" />
                    <ShortcutKeys square shortcut="↵" />
                  </Button>
                </span>
              </SheetFooter>
            </form>
          ) : (
            <span className="relative flex h-full flex-col justify-between gap-4 py-4">
              <span className="flex flex-col gap-4">
                <span className="mb-4 flex items-center justify-start gap-4">
                  <Avatar className="h-16 w-16 items-center justify-center border border-black bg-muted">
                    <AvatarImage src={contact?.avatar ?? undefined} />
                    <AvatarFallback>
                      {`${String(contact?.fullName)}`.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-xl font-bold">{contact?.fullName}</h1>
                </span>
                {contact && contact.groups.length > 0 && (
                  <>
                    <span className={cn('text-sm')}>Groups</span>
                    <span className="block gap-2">
                      {contact.groups
                        .filter((group) => selectedGroups.includes(group.id))
                        .map((group) => (
                          <Chip
                            key={group.id}
                            className="mb-2 mr-2 inline-block"
                            {...group}
                          />
                        ))}
                    </span>
                  </>
                )}
                {contact?.firstMet && (
                  <>
                    <span className={cn('text-sm')}>Date Met</span>
                    <h1 className={cn('text-sm text-muted-foreground')}>
                      {format(contact.firstMet, 'MMM d, yyyy')}
                    </h1>
                  </>
                )}
                {contact?.phone && (
                  <>
                    <span className={cn('text-sm')}>Phone</span>
                    <a
                      href={'tel:' + contact.phone}
                      className={cn('text-sm text-muted-foreground')}
                    >
                      {contact.phone}
                    </a>
                  </>
                )}
                {contact?.email && (
                  <>
                    <span className={cn('text-sm')}>Email</span>
                    <a
                      href={'mailto:' + contact.email}
                      className={cn('text-sm text-muted-foreground')}
                    >
                      {contact.email}
                    </a>
                  </>
                )}
                {contact?.notes && (
                  <>
                    <span className={cn('text-sm')}>Notes</span>
                    <h1 className={cn('text-sm text-muted-foreground')}>
                      {contact.notes}
                    </h1>
                  </>
                )}
              </span>
              <SheetFooter>
                <Button
                  className="fixed bottom-4 flex gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                  <ShortcutKeys square shortcut="E" />
                </Button>
              </SheetFooter>
            </span>
          )}
        </span>
        <span className="flex h-screen w-full flex-col gap-4 bg-muted p-6">
          <span className="flex justify-end gap-2">
            <Button
              className="flex gap-2"
              onClick={() => setIsAddingInteraction(true)}
            >
              Log Interaction <ShortcutKeys square shortcut="I" />
            </Button>
          </span>
          {isAddingInteraction && contact && (
            <NewInteractionCard
              contactId={contact.id}
              close={() => setIsAddingInteraction(false)}
            />
          )}
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
          {!contact &&
            isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          {contact && contact.interactions.length === 0 && (
            <span className="flex h-full grow flex-col items-center justify-center gap-2">
              <h1 className="text-[4rem]">🤕</h1>
              <h1 className="text-lg">No interactions found</h1>
            </span>
          )}
        </span>
      </SheetContent>
    </Sheet>
  );
};

const NewInteractionCard = ({
  contactId,
  close,
}: {
  contactId: string;
  close: () => void;
}) => {
  const { toast } = useToast();
  const ctx = api.useContext();
  const form = useForm<InteractionCreateValues>({
    resolver: zodResolver(interactionCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      contactId,
      date: new Date(),
    },
  });
  const { mutate: createInteraction, isLoading } =
    api.interaction.create.useMutation();

  const { data: types } = api.interactionType.getAll.useQuery(undefined, {
    queryKey: ['interactionType.getAll', undefined],
    _optimisticResults: 'optimistic',
  });

  const onSubmit = (data: InteractionCreateValues) => {
    createInteraction(
      { ...data },
      {
        onSuccess: () => {
          toast({
            title: '✅ Success',
            description: `Interaction created successfully!`,
          });
          form.reset();
          close();
          void ctx.interaction.getAll.invalidate();
          void ctx.interaction.getAllByContactId.invalidate({
            contactId: data.contactId,
          });
          void ctx.contact.getById.invalidate({ id: data.contactId });
        },
        onError: (err) => {
          toast({
            title: '❌ Error',
            description: `Error creating interaction: ${err.message}`,
          });
        },
      }
    );
  };
  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Card>
        <CardContent className={cn('flex flex-col gap-2 px-4 pb-4 pt-4')}>
          <FormField
            control={form.control}
            name="typeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {types &&
                        types.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[200px] justify-start text-left font-normal',
                          !form.getValues().date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.getValues().date ? (
                          format(form.getValues().date, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        {...field}
                        mode="single"
                        selected={form.getValues().date}
                        onSelect={(date) => date && form.setValue('date', date)}
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
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="ghost"
            isLoading={isLoading}
            onClick={() => {
              close();
              form.reset();
            }}
          >
            Cancel
          </Button>
          <Button isLoading={isLoading} type="submit">
            Save
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
