import { cn } from '@/lib/utils';

export const ShortcutKeys = ({
  shortcut,
  square,
}: {
  shortcut: string;
  square?: boolean;
}) => (
  <span
    className={cn(
      'min-w-5 flex h-5 items-center justify-center rounded border px-1 font-mono text-xs',
      square ? 'aspect-square' : 'aspect-auto'
    )}
  >
    {shortcut}
  </span>
);
