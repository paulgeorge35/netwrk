import { Bookmark, Clock, Plus, Search, Settings, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/router";
import * as z from "zod";
import EmojiPicker from "emoji-picker-react";
import { Input } from "@/components/ui/input";
// import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./react-hook-form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";
import { api } from "@/utils/api";
import { Skeleton } from "./ui/skeleton";
import { Avatar } from "./ui/avatar";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

const groupFormSchema = z.object({
  icon: z.string({
    required_error: "Icon is required.",
    invalid_type_error: "Icon format is not valid.",
  }),
  name: z
    .string({
      required_error: "Name is required.",
    })
    .max(16, {
      message: "Name must be at most 16 characters.",
    }),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

const defaultValues: GroupFormValues = {
  icon: "🏡",
  name: "",
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  userId?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useUser();
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const onSubmit = (_: GroupFormValues) => {
    setIsLoading(true);
    // await handleGroupCreate(data);
    setIsLoading(false);
    setIsDialogOpen(false);
  };

  const navigateTo = (path: string) => {
    router.push(path).catch((err) => console.error(err));
  };

  const { data: groups, isLoading: isLoadingGroups } =
    api.group.getAll.useQuery();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link href="/">
            <h1 className="text-xl font-semibold tracking-tight">MyNetwrk</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Avatar>
              <Image
                src={user?.profileImageUrl || ""}
                alt={`@${user?.username || "Avatar"}`}
                width={48}
                height={48}
              />
            </Avatar>
            <Separator
              orientation="horizontal"
              className="my-6 flex-1 border-[1px]"
            />
          </div>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button
              variant={router.pathname === "/settings" ? "secondary" : "ghost"}
              onClick={() => navigateTo("/settings")}
              size="sm"
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant={router.pathname === "/reminders" ? "secondary" : "ghost"}
              onClick={() => navigateTo("/reminders")}
              size="sm"
              className="w-full justify-start"
            >
              <Clock className="mr-2 h-4 w-4" />
              Reminders
            </Button>
            <Button
              variant={
                router.pathname === "/interactions" ? "secondary" : "ghost"
              }
              onClick={() => navigateTo("/interactions")}
              size="sm"
              className="w-full justify-start"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Interactions
            </Button>
            <Button
              variant={router.pathname === "/" ? "secondary" : "ghost"}
              onClick={() => navigateTo("/")}
              size="sm"
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              All People
            </Button>
          </div>
        </div>
        <div className="py-2">
          <div className="flex w-full items-center justify-between px-6 pr-4">
            <h2 className="relative text-lg font-semibold tracking-tight">
              Groups
            </h2>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open: boolean) => setIsDialogOpen(open)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className=" mr-2 h-4 w-4 p-0"
                >
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Add Group</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>New Group</DialogTitle>
                  <DialogDescription className="my-1 rounded-xl bg-secondary p-4 text-secondary-foreground">
                    {`💡 Groups allow you to "group" people together for quick
                    access. You can create a group for "close friends", "work
                    friends", "clients", etc...`}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={() => form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Icon</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Input
                                  type="button"
                                  className="flex h-20 w-20 items-center justify-center rounded-lg border-dashed text-4xl hover:cursor-pointer hover:border-blue-600"
                                  {...field}
                                />
                              </PopoverTrigger>
                              <span className="sr-only">Open popover</span>
                              <PopoverContent side="right" className="w-96 p-4">
                                <EmojiPicker
                                  onEmojiClick={(emoji) =>
                                    form.setValue("icon", emoji.emoji)
                                  }
                                  lazyLoadEmojis
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button disabled={isLoading} type="submit">
                        Create Group
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="h-[300px] px-2">
            <div className="space-y-1 p-2">
              {isLoadingGroups || !groups
                ? Array.from(Array(5)).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-8 w-full justify-between font-normal"
                    />
                  ))
                : groups.map((group, i) => (
                    <Button
                      key={`${group.id}-${i}`}
                      onClick={() => {
                        navigateTo(`/group/${group.id}`);
                      }}
                      // variant={
                      //   group.id === useParams().slug ? "secondary" : "ghost"
                      // }
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between font-normal"
                    >
                      <span className="mr-2">{group.icon}</span>
                      {group.name}
                      <span className="ml-auto text-xs font-semibold">
                        {group.count}
                      </span>
                    </Button>
                  ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}