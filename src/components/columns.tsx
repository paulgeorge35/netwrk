'use client';

import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';

import { type Contact } from '../data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format } from 'date-fns';

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: 'avatar',
    enableHiding: true,
  },
  {
    accessorKey: 'lastInteractionType',
    enableHiding: true,
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader className="ml-2" column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[200px] items-center">
          <span className="flex items-center gap-2">
            <Avatar className="h-5 w-5 items-center justify-center border border-black bg-muted">
              <AvatarImage src={row.getValue('avatar')} />
              <AvatarFallback>
                {/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */}
                {`${row.getValue('fullName')}`
                  .split(' ')
                  .map((n) => n[0])
                  .filter((_, index) => index < 1)
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {row.getValue('fullName')}
          </span>
        </div>
      );
    },
    enablePinning: true,
    enableResizing: true,
    enableHiding: false,
  },
  {
    accessorKey: 'lastInteraction',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Interaction" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          {row.original.lastInteractionType && (
            <Badge variant="outline">
              {row.getValue('lastInteractionType')}
            </Badge>
          )}
          {row.getValue('lastInteraction') ? (
            <span className="max-w-[300px] truncate font-medium">
              {format(new Date(row.getValue('lastInteraction')), 'MMM d, yyyy')}
            </span>
          ) : (
            <span className="max-w-[300px] truncate font-light text-muted-foreground">
              No interactions yet
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[250px] max-w-[500px] items-center truncate">
          <span>{row.getValue('notes') ?? '-'}</span>
        </div>
      );
    },
  },
];
