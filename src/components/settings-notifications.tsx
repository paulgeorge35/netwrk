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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from './ui/switch';
import { api } from '@/utils/api';
import { useToast } from './ui/use-toast';

const notificationsFormSchema = z.object({
  reminderEmails: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export function SettingsNotifications() {
  const { toast } = useToast();
  const { data } = api.user.me.useQuery();
  const { mutate: updateSettings } = api.user.updateConfig.useMutation({});

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      reminderEmails: data?.config?.reminderEmails ?? false,
    },
  });

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

  return (
    <TabsContent value="notifications">
      <Card>
        <CardContent className="space-y-2 pt-4">
          <Form {...form}>
            <form className="space-y-8">
              {data?.config && (
                <FormField
                  control={form.control}
                  name="reminderEmails"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Reminder emails</FormLabel>
                      <FormDescription>
                        We&apos;ll send reminders to your email
                      </FormDescription>
                      <FormMessage />
                      <FormControl
                        onChange={() => void form.handleSubmit(onSubmit)}
                      >
                        <Switch {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
