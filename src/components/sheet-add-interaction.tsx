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
import { CalendarIcon, Check, Sparkles } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { useToast } from './ui/use-toast';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import Confetti from 'react-confetti-explosion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const interactionCreateSchema = z.object({
  date: z.date(),
  notes: z.string().max(1500).optional(),
  typeId: z.string(),
  contactId: z.string(),
});

type InteractionCreateValues = z.infer<typeof interactionCreateSchema>;
type PromptType = 'SUMMARY' | 'SPELLING';

export const AddInteractionSheet = () => {
  const { toast } = useToast();
  const [confetti, setConfetti] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);
  const [openPop, setOpenPop] = React.useState<boolean>(false);
  const [selectedContactId, setSelectedContactId] = React.useState<
    string | undefined
  >(undefined);

  useHotkeys('i', () => {
    setOpen(true);
  });

  useHotkeys('mod+enter', () => {
    void form.handleSubmit(onSubmit)();
  });

  const { mutate: createInteraction, isLoading } =
    api.interaction.create.useMutation();
  const { data: types } = api.interactionType.getAll.useQuery(undefined, {
    queryKey: ['interactionType.getAll', undefined],
    _optimisticResults: 'optimistic',
  });

  const { data: contacts } = api.contact.getAll.useQuery(undefined, {
    queryKey: ['contact.getAll', undefined],
    _optimisticResults: 'optimistic',
  });

  const form = useForm<InteractionCreateValues>({
    resolver: zodResolver(interactionCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      date: new Date(),
    },
  });
  const { mutate: aiQuery, isLoading: isFetching } = api.ai.query.useMutation({
    onSuccess: (data) => {
      if (data && data.length > 0 && data !== form.getValues('notes')) {
        form.setValue('notes', data);
        setConfetti(true);
      }
    },
    onError: (err) => {
      toast({
        title: '❌ Error',
        description: err.message,
      });
    },
  });

  const ctx = api.useContext();

  const SubmitAIQuery = (queryPrompt: PromptType) => {
    void aiQuery({
      text: form.getValues('notes') || '',
      prompt: queryPrompt,
    });
  };

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
          setOpen(false);
          void ctx.interaction.getAll.invalidate();
          void ctx.interaction.getAllByContactId.invalidate({
            contactId: data.contactId,
          });
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
    <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
      <SheetTrigger asChild>
        <Button className="flex gap-2" onClick={() => setOpen(true)}>
          Create Interaction <ShortcutKeys shortcut="I" square />
        </Button>
      </SheetTrigger>
      <SheetContent className="h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Interaction</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-col justify-between gap-4 py-4"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <span className="flex flex-col justify-between gap-4 ">
            <FormField
              control={form.control}
              name="contactId"
              render={() => (
                <FormItem>
                  <FormLabel className="block">Contact</FormLabel>
                  <FormControl>
                    <Popover open={openPop} onOpenChange={setOpenPop}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPop}
                          className="w-[200px] justify-between"
                        >
                          {selectedContactId && contacts
                            ? contacts.find(
                                (contact) => contact.id === selectedContactId
                              )?.fullName
                            : 'Select contact...'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="max-h-[300px] w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search contact..." />
                          <CommandEmpty>No contact found.</CommandEmpty>
                          <CommandGroup>
                            {contacts &&
                              contacts.map((contact) => (
                                <CommandItem
                                  key={contact.id}
                                  onSelect={(currentValue) => {
                                    setSelectedContactId(
                                      currentValue === selectedContactId
                                        ? undefined
                                        : contact.id
                                    );
                                    if (currentValue === selectedContactId)
                                      form.reset({ contactId: undefined });
                                    else form.setValue('contactId', contact.id);
                                    setOpenPop(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedContactId === contact.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {contact.fullName}
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
                          onSelect={(date) =>
                            date && form.setValue('date', date)
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
                    <span className="relative">
                      <Textarea className="min-h-[150px]" {...field} />
                      <span className="absolute bottom-2 right-2 flex h-6 justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              disabled={
                                isFetching ||
                                !form.getValues().notes ||
                                String(form.getValues().notes).length < 10
                              }
                              isLoading={isFetching}
                              className="h-6 w-6"
                            >
                              <Sparkles className="h-4 w-4" />
                              {confetti && !isFetching && (
                                <Confetti
                                  onComplete={() => setConfetti(false)}
                                  height={300}
                                  particleSize={4}
                                  width={300}
                                  zIndex={1000}
                                />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-14">
                            <DropdownMenuItem
                              onClick={() => SubmitAIQuery('SUMMARY')}
                            >
                              <span>Summarize text</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => SubmitAIQuery('SPELLING')}
                            >
                              <span>Fix spelling</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </span>
                    </span>
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
              Create Interaction
              <ShortcutKeys square shortcut="⌘" />
              <ShortcutKeys square shortcut="↵" />
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
