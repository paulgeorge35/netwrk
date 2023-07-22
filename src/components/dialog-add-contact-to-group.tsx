import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ShortcutKeys } from './ui/shortcut-key';
import { useState } from 'react';
import { Input } from './ui/input';
import { api } from '@/utils/api';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { useToast } from './ui/use-toast';
import Image from 'next/image';

export function AddContactToGroupDialog({
  defaultGroup,
}: {
  defaultGroup: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [contactIndex, setContactIndex] = useState<number>(0);
  const [selected, setSelected] = useState<string[]>([]);
  const ctx = api.useContext();

  useHotkeys('mod+a', () => {
    if (!open) {
      setOpen(true);
      setSelected([]);
    }
  });

  useHotkeys('mod+enter', () => {
    if (selected.length === 0 && isLoading) return;
    addContactsToGroup(
      {
        id: defaultGroup,
        contactIds: selected,
      },
      {
        onSuccess: () => {
          toast({
            title: '✅ Success',
            description: `Successfully added ${selected.length} contacts to this group!`,
          });
          setOpen(false);
          void ctx.contact.getAllByGroupId.invalidate({
            groupId: defaultGroup,
          });
          void ctx.group.getOne.invalidate(defaultGroup);
        },
        onError: (err) => {
          toast({
            title: '❌ Error',
            description: `Error adding contacts: ${err.message}`,
          });
        },
      }
    );
  });

  const { data: searchResults } = api.contact.getAllNotInGroup.useQuery(
    {
      groupId: defaultGroup,
      search,
    },
    {
      enabled: search.trim().length > 0,
      _optimisticResults: 'optimistic',
      queryKey: ['contact.getAllNotInGroup', { groupId: defaultGroup, search }],
    }
  );

  const { mutate: addContactsToGroup, isLoading } =
    api.group.addManyContacts.useMutation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2" onClick={() => setOpen(true)}>
          Add to Group <ShortcutKeys shortcut="⌘" square />{' '}
          <ShortcutKeys shortcut="A" square />
        </Button>
      </DialogTrigger>
      <DialogContent
        floating
        className="top-[20%] flex translate-y-0 flex-col justify-start p-4 sm:h-[500px] sm:max-w-[500px]"
      >
        <DialogHeader>
          <span className="flex justify-between">
            <h1>{`${selected.length} selected`}</h1>
            <h1 className="flex items-center gap-1 text-sm text-green-500">
              Add to group <ShortcutKeys square shortcut="⌘" />{' '}
              <ShortcutKeys shortcut="Enter" />
            </h1>
          </span>
        </DialogHeader>
        <Input
          search
          className="h-12 w-full"
          placeholder="Search contacts"
          value={search}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              searchResults &&
                setContactIndex((i) => (i + 1) % searchResults.length);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              searchResults &&
                setContactIndex(
                  (i) => (i - 1 + searchResults.length) % searchResults.length
                );
            }
          }}
          onChange={(e) => {
            open && setSearch(e.target.value);
            setContactIndex(0);
          }}
        />
        <span className="flex h-full flex-col">
          {search.trim() !== '' &&
            searchResults &&
            searchResults.length > 0 &&
            searchResults.map((contact, i) => (
              <a
                key={contact.id}
                role="button"
                className={cn(
                  'flex items-center justify-between p-2 hover:bg-muted',
                  contactIndex === i && 'bg-muted'
                )}
                onClick={() =>
                  setSelected((current) =>
                    current.includes(contact.id)
                      ? current.filter((c) => c !== contact.id)
                      : [...current, contact.id]
                  )
                }
                onMouseOver={() => setContactIndex(i)}
              >
                <span className="flex items-center justify-start gap-2">
                  <Checkbox checked={selected.includes(contact.id)} />
                  <Avatar className="h-5 w-5 items-center justify-center border border-black bg-muted">
                    <AvatarImage src={contact.avatar ?? undefined} />
                    <AvatarFallback className="text-center">
                      {/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */}
                      {`${contact.fullName}`.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <h1>{contact.fullName}</h1>
                </span>
              </a>
            ))}
          {search.trim() !== '' &&
            searchResults &&
            searchResults.length === 0 && (
              <span className="flex h-full grow flex-col items-center justify-center gap-2">
                <Image
                  alt="No results"
                  width={64}
                  height={64}
                  src="/no-results.png"
                />
                <h1 className="text-lg">No contacts found</h1>
              </span>
            )}
        </span>
      </DialogContent>
    </Dialog>
  );
}
