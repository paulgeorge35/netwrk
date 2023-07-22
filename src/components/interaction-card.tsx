import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { highlightText } from '@/lib/helper';
import type { Contact, Interaction, InteractionType } from '@prisma/client';
import {
  CalendarIcon,
  Edit2,
  Mail,
  MoreVertical,
  Phone,
  Sparkle,
  User,
  Video,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AlertDestructive } from './alert-destructive';
import { api } from '@/utils/api';
import { useToast } from './ui/use-toast';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from './react-hook-form/form';
import { Select } from '@radix-ui/react-select';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

const interactionUpdateSchema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  notes: z.string().max(250).optional(),
  typeId: z.string().uuid(),
});

type InteractionUpdateValues = z.infer<typeof interactionUpdateSchema>;

export const InteractionCard = ({
  interaction,
  search,
  editable,
  solo,
}: {
  interaction: Interaction & { type: InteractionType; contact: Contact };
  search?: string;
  editable?: boolean;
  solo?: boolean;
}) => {
  const [alert, setAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { mutate: deleteInteraction } = api.interaction.delete.useMutation();
  const { mutate: updateInteraction, isLoading } =
    api.interaction.update.useMutation();
  const { data: types } = api.interactionType.getAll.useQuery(undefined, {
    queryKey: ['interactionType.getAll', undefined],
    enabled: isEditing,
    _optimisticResults: 'optimistic',
  });
  const ctx = api.useContext();

  const handleDelete = (id: string) => {
    deleteInteraction(
      {
        id,
      },
      {
        onSuccess: () => {
          toast({
            title: '✅ Success',
            description: `Interaction deleted successfully!`,
          });
          void ctx.interaction.getAll.invalidate();
        },
      }
    );
  };

  const form = useForm<InteractionUpdateValues>({
    resolver: zodResolver(interactionUpdateSchema),
    mode: 'onBlur',
    defaultValues: {
      id: interaction.id,
      date: interaction.date,
      notes: interaction.notes ?? undefined,
      typeId: interaction.typeId,
    },
  });

  const onSubmit = (data: InteractionUpdateValues) => {
    updateInteraction(
      { ...data },
      {
        onSuccess: () => {
          toast({
            title: '✅ Success',
            description: `Interaction updated successfully!`,
          });
          form.reset();
          setIsEditing(false);
          void ctx.interaction.getAll.invalidate();
          void ctx.interaction.getAllByContactId.invalidate({
            contactId: interaction.contactId,
          });
        },
        onError: (err) => {
          toast({
            title: '❌ Error',
            description: `Error updating interaction: ${err.message}`,
          });
        },
      }
    );
  };

  if (isEditing)
    return (
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card key={interaction.id}>
          <CardContent
            className={cn('px-4 pb-4', isEditing && 'flex flex-col gap-2 pt-4')}
          >
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
                setIsEditing(false);
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

  return (
    <Card key={interaction.id}>
      <CardHeader className="relative flex flex-row items-center justify-between p-4">
        {solo ? (
          <span className="flex justify-start gap-2">
            <InteractionTypeIcon type={interaction.type.name} />
            <span className="flex flex-col items-start">
              <h1 className="text-sm font-bold">{interaction.type.name}</h1>
              <h1 className="text-xs font-light text-muted-foreground">
                {format(new Date(interaction.date), 'MMM dd, yyyy')}
              </h1>
            </span>
          </span>
        ) : (
          <div className="flex items-baseline gap-2 text-sm font-semibold leading-none tracking-tight">
            <Avatar className="h-5 w-5 items-center justify-center border border-black bg-muted">
              <AvatarImage src={interaction.contact.avatar ?? undefined} />
              <AvatarFallback>
                {`${interaction.contact.fullName}`
                  .split(' ')
                  .map((n) => n[0])
                  .filter((_, index) => index < 1)
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <h1>
              {search
                ? highlightText(interaction.contact.fullName, search)
                : interaction.contact.fullName}
            </h1>
            {' · '}
            <h1 className="font-medium text-muted-foreground">
              {interaction.type.name}
            </h1>
          </div>
        )}
        {editable && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 h-6 w-6"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-14">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAlert(true)}>
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDestructive
              solo
              open={alert}
              onOpenChange={setAlert}
              action={() => handleDelete(interaction.id)}
            />
          </>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <h1 className="text-sm font-light text-muted-foreground">
          {interaction.notes &&
            search &&
            highlightText(interaction.notes, search)}
          {interaction.notes && !search && interaction.notes}
        </h1>
      </CardContent>
    </Card>
  );
};

const InteractionTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'In Person':
      return (
        <User className="h-9 w-9 rounded-lg bg-red-200 p-1 text-red-400" />
      );
    case 'Phone':
      return (
        <Phone className="h-9 w-9 rounded-lg bg-green-200 p-1 text-green-400" />
      );
    case 'Email':
      return (
        <Mail className="h-9 w-9 rounded-lg bg-orange-200 p-1 text-orange-400" />
      );
    case 'Video Call':
      return (
        <Video className="h-9 w-9 rounded-lg bg-blue-200 p-1 text-blue-400" />
      );
    case 'Note':
      return (
        <Edit2 className="h-9 w-9 rounded-lg bg-violet-200 p-1 text-violet-400" />
      );
    default:
      return (
        <Sparkle className="bg-pink-200-200 h-9 w-9 rounded-lg p-1 text-pink-400" />
      );
  }
};
