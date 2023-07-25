import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { ShortcutKeys } from './ui/shortcut-key';
import { Input } from './ui/input';
import { z } from 'zod';
import { api } from '@/utils/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from './react-hook-form/form';
import { Textarea } from './ui/textarea';
import { format } from 'date-fns';
import { CalendarIcon, FileImage, Plus, X } from 'lucide-react';
import React, { type ChangeEvent } from 'react';
import { Avatar } from './ui/avatar';
import Image from 'next/image';
import { cn, fileToBase64 } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { useToast } from './ui/use-toast';
import { Chip } from './ui/chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useHotkeys } from 'react-hotkeys-hook';

const personCreateSchema = z.object({
  fullName: z.string().max(50),
  firstMet: z.date().optional(),
  avatar: z.string().optional(),
  notes: z.string().max(1500).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  groups: z.array(z.string().uuid()).optional(),
});

type PersonCreateValues = z.infer<typeof personCreateSchema>;

export const AddContactSheet = ({
  defaultGroup,
}: {
  defaultGroup?: string;
}) => {
  const { toast } = useToast();
  const hiddenFileInput = React.useRef<null | HTMLInputElement>(null);
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedGroups, setSelectedGroups] = React.useState<string[]>(
    defaultGroup ? [defaultGroup] : []
  );

  useHotkeys('p', () => {
    setOpen(true);
  });
  useHotkeys(
    'mod+enter',
    () => {
      void form.handleSubmit(onSubmit)();
    },
    {
      preventDefault: true,
    }
  );

  const { mutate: createPerson, isLoading } = api.contact.create.useMutation();
  const { data: groups } = api.group.getAll.useQuery(undefined, {
    queryKey: ['group.getAll', undefined],
    _optimisticResults: 'optimistic',
  });

  const form = useForm<PersonCreateValues>({
    resolver: zodResolver(personCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      groups: defaultGroup ? [defaultGroup] : [],
    },
  });

  const ctx = api.useContext();

  const onSubmit = (data: PersonCreateValues) => {
    createPerson(
      { ...data },
      {
        onSuccess: () => {
          toast({
            title: '✅ Success',
            description: `Contact created successfully!`,
          });
          form.reset();
          setOpen(false);
          void ctx.contact.getAll.invalidate();
          defaultGroup && void ctx.group.getOne.invalidate(defaultGroup);
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
    <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
      <SheetTrigger asChild>
        <Button className="flex gap-2" onClick={() => setOpen(true)}>
          Create Person <ShortcutKeys shortcut="P" square />
        </Button>
      </SheetTrigger>
      <SheetContent className="h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Person</SheetTitle>
        </SheetHeader>
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
                          ...selectedGroups.filter((groupId) => groupId !== id),
                        ]);
                        form.setValue('groups', [
                          ...selectedGroups.filter((groupId) => groupId !== id),
                        ]);
                      }}
                      {...group}
                    />
                  ))}
              <DropdownMenu>
                {groups &&
                  groups.filter((group) => !selectedGroups.includes(group.id))
                    .length !== 0 && (
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
          <SheetFooter>
            <Button
              type="submit"
              className="fixed bottom-4 right-4 flex gap-2"
              isLoading={isLoading}
            >
              Create Person
              <ShortcutKeys square shortcut="↵" />
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
