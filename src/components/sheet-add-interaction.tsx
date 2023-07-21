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
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { useToast } from './ui/use-toast';
import { useHotkeys } from 'react-hotkeys-hook';

const interactionCreateSchema = z.object({
  date: z.date(),
  notes: z.string().max(250).optional(),
  typeId: z.string(),
  contactId: z.string(),
});

type InteractionCreateValues = z.infer<typeof interactionCreateSchema>;

export const AddInteractionSheet = () => {
  const { toast } = useToast();
  const [open, setOpen] = React.useState<boolean>(false);

  useHotkeys('i', () => {
    setOpen(true);
  });

  const { mutate: createInteraction, isLoading } =
    api.interaction.create.useMutation();
  const { data: types } = api.interactionType.getAll.useQuery(undefined, {
    queryKey: ['interactionType.getAll', undefined],
    _optimisticResults: 'optimistic',
  });

  const form = useForm<InteractionCreateValues>({
    resolver: zodResolver(interactionCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      date: new Date(),
    },
  });

  const ctx = api.useContext();

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
          <SheetTitle>New Person</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-col justify-between gap-4 py-4"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <span className="flex flex-col justify-between gap-4 ">
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
                            'w-[280px] justify-start text-left font-normal',
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
                    <Textarea {...field} />
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
              <ShortcutKeys square shortcut="↵" />
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
