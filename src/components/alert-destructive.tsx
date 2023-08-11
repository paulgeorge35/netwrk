import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

export function AlertDestructive({
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone.',
  button = 'Delete',
  icon,
  solo,
  open,
  onOpenChange,
  action,
}: {
  title?: string;
  icon?: ReactNode;
  description?: string;
  button?: string;
  solo?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  action: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {!solo && (
          <Button size={icon ? 'icon' : 'default'} variant="destructive">
            {icon ?? button}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={action}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
