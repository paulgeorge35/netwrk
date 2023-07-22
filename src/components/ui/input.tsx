import * as React from 'react';

import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placehold?: 'string';
  search?: boolean;
  searchClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, search, searchClassName, ...props }, ref) => {
    return search ? (
      <span
        className={cn(
          'flex h-12 w-full items-center rounded-md border border-input bg-background text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          searchClassName
        )}
      >
        <MagnifyingGlassIcon className="mx-3 h-4 w-4 shrink-0 opacity-50" />
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border-none bg-transparent placeholder:text-muted-foreground focus:border-none focus-visible:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
      </span>
    ) : (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
