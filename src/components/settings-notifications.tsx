import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from './react-hook-form/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from './ui/switch';
import { api } from '@/utils/api';
import { useToast } from './ui/use-toast';
import { useEffect } from 'react';

const notificationsFormSchema = z.object({
  reminderEmails: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export function SettingsNotifications() {
  const { data } = api.user.me.useQuery();

  return (
    <TabsContent value="notifications">
      <Card>
        <CardContent className="space-y-2 pt-4">
          {data?.config?.reminderEmails !== undefined && (
            <ReminderSwitch value={data?.config?.reminderEmails} />
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

const ReminderSwitch = ({ value }: { value: boolean }) => {
  const { toast } = useToast();
  const { mutate: updateSettings } = api.user.updateConfig.useMutation({});

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      reminderEmails: value,
    },
  });

  const { watch, handleSubmit } = form;

  useEffect(() => {
    const onSubmit = (data: NotificationsFormValues) => {
      updateSettings(
        { ...data },
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

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="reminderEmails"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between space-y-1">
              <span>
                <FormLabel>Reminder emails</FormLabel>
                <FormDescription>
                  We&apos;ll send reminders to your email
                </FormDescription>
              </span>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
