import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './react-hook-form/form';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { signOut, useSession } from 'next-auth/react';
import { type User } from '@prisma/client';
import { useToast } from './ui/use-toast';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function SettingsAccount() {
  const session = useSession();
  const {
    data: me,
    status,
    refetch,
  } = api.user.me.useQuery(undefined, {
    queryKey: ['user.me', undefined],
    enabled: false,
  });

  useEffect(() => {
    if (session) void refetch();
  }, [session, refetch]);

  return (
    <TabsContent value="account" className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Profile</h1>
      <Card>
        <CardContent className="pt-4">
          {me?.name && <NameForm me={me} />}
          {status === 'loading' && (
            <span>
              <Label>Name</Label>
              <Skeleton className="my-4 h-8 w-full max-w-sm" />
            </span>
          )}
        </CardContent>
      </Card>
      <h1 className="text-lg font-bold">Timezone</h1>
      <Card>
        <CardContent className="pt-4">
          {me?.config?.timezoneId && (
            <TimezoneSelect value={me.config.timezoneId} />
          )}
          {status === 'loading' && (
            <span>
              <Label>Timezone</Label>
              <Skeleton className="my-4 h-8 w-full max-w-sm" />
            </span>
          )}
        </CardContent>
      </Card>
      <span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="lg" variant="destructive">
              Log Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to sign out?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  void signOut({
                    callbackUrl: '/sign-in',
                  });
                }}
              >
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </span>
    </TabsContent>
  );
}

const nameFormSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, { message: 'Name must be at least 3 characters' }),
});

type NameFormValues = z.infer<typeof nameFormSchema>;

const NameForm = ({ me }: { me: User }) => {
  const { toast } = useToast();
  const [edit, setEdit] = useState(false);
  const { mutate, isLoading } = api.user.update.useMutation();
  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: me.name ?? '',
    },
  });

  const ctx = api.useContext();

  const onSubmit = (data: NameFormValues) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: '✅ Success',
          description: `Profile updated successfully!`,
        });
        setEdit(false);
        void ctx.user.me.invalidate();
      },
      onSettled: () => {
        setEdit(false);
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex max-w-md gap-1 space-y-8"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                {edit ? (
                  <Input {...field} />
                ) : (
                  <p className="p-1 text-muted-foreground">
                    {form.getValues().name}
                  </p>
                )}
              </FormControl>
              {edit && (
                <FormDescription>
                  This is the name that will be displayed on your profile and in
                  emails.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        {edit && (
          <Button
            disabled={isLoading}
            // type="reset"
            variant="outline"
            onClick={() => setEdit(false)}
          >
            Cancel
          </Button>
        )}
        {edit && (
          <Button isLoading={isLoading} type="submit">
            Save
          </Button>
        )}
        {!edit && (
          <Button type="button" variant="ghost" onClick={() => setEdit(true)}>
            Edit
          </Button>
        )}
      </form>
    </Form>
  );
};

const notificationsFormSchema = z.object({
  timezoneId: z.number(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

const TimezoneSelect = ({ value }: { value: number }) => {
  const session = useSession();
  const { toast } = useToast();
  const [openPop, setOpenPop] = useState<boolean>(false);
  const [selectedTimezoneId, setSelectedTimezoneId] = useState<
    number | undefined
  >(value ?? undefined);
  const { data: timezones, refetch } = api.timezone.getAll.useQuery(undefined, {
    queryKey: ['timezone.getAll', undefined],
    enabled: false,
  });
  const { mutate: updateSettings } = api.user.updateConfig.useMutation({});

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      timezoneId: value,
    },
  });

  const { watch, handleSubmit } = form;

  useEffect(() => {
    const onSubmit = (data: NotificationsFormValues) => {
      updateSettings(
        { timezoneId: Number(data.timezoneId) },
        {
          onSuccess: () => {
            toast({
              title: '✅ Success',
              description: 'Your settings have been updated.',
            });
          },
          onError: (err) => {
            toast({
              title: '❌ Error',
              description: `Error updating settings: ${err.message}`,
            });
          },
        }
      );
    };
    const subscription = watch(() => void handleSubmit(onSubmit)());
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, updateSettings, toast]);

  useEffect(() => {
    if (session) void refetch();
  }, [session, refetch]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="timezoneId"
          render={() => (
            <FormItem className="flex flex-col gap-2 space-y-1">
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <Popover open={openPop} onOpenChange={setOpenPop}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPop}
                      className="w-[500px] justify-between"
                    >
                      {(selectedTimezoneId &&
                        timezones &&
                        timezones.find(
                          (timezone) => timezone.id === selectedTimezoneId
                        )?.name) ??
                        'Select timezone...'}
                      <CaretSortIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-[300px] w-[500px] overflow-hidden p-0">
                    <Command>
                      <CommandInput placeholder="Search timezone..." />
                      <CommandEmpty>No timezone found.</CommandEmpty>
                      <CommandGroup className="overflow-y-auto">
                        {timezones &&
                          timezones.map((timezone) => (
                            <CommandItem
                              key={timezone.id}
                              onSelect={(currentValue) => {
                                setSelectedTimezoneId(
                                  currentValue ===
                                    selectedTimezoneId?.toString()
                                    ? undefined
                                    : timezone.id
                                );
                                if (
                                  currentValue ===
                                  selectedTimezoneId?.toString()
                                )
                                  form.reset({ timezoneId: undefined });
                                else form.setValue('timezoneId', timezone.id);
                                setOpenPop(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedTimezoneId === timezone.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {timezone.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
