import { cn } from '@/lib/utils';
import { Button } from './button';
import { X } from 'lucide-react';

export const Chip = ({
  id,
  icon,
  name,
  action,
  className,
}: {
  id: string;
  icon: string;
  name: string;
  action: (id: string) => void;
  className?: string;
}) => (
  <span
    className={cn(
      'flex h-8 w-auto items-center justify-center gap-2 rounded-full border bg-muted p-2 text-xs',
      className
    )}
  >
    {`${icon} ${name}`}
    <Button
      variant="ghost"
      className="ml-2 h-3 w-3 p-0"
      onClick={() => action(id)}
    >
      <X className="h-3 w-3" />
    </Button>
  </span>
);
