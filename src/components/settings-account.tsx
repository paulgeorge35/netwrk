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
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useState } from 'react';
import { api } from '@/utils/api';
import { signOut } from 'next-auth/react';
import { type User } from '@prisma/client';
import { useToast } from './ui/use-toast';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import { env } from '@/env.mjs';

export function SettingsAccount() {
  const { data: me, status } = api.user.me.useQuery();

  return (
    <TabsContent value="account" className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Basic Info</h1>
      <Card>
        <CardContent className="pt-4">
          {me && <NameForm me={me} />}
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
          {status === 'loading' && (
            <span>
              <Label>Timezone</Label>
              <Skeleton className="my-4 h-8 w-full max-w-sm" />
            </span>
          )}
        </CardContent>
      </Card>
      <span>
        <Button
          size="lg"
          variant="destructive"
          onClick={() => {
            void signOut({ callbackUrl: `${env.NEXTAUTH_URL}/sign-in` });
          }}
        >
          Log Out
        </Button>
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

const defaultValuesName: Partial<NameFormValues> = {
  name: '',
};

const NameForm = ({ me }: { me: User }) => {
  const { toast } = useToast();
  const [edit, setEdit] = useState(false);
  const { mutate, isLoading } = api.user.update.useMutation();
  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: me?.name ?? defaultValuesName.name,
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
