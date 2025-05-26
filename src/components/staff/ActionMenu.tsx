"use client"

import { 
  MoreHorizontal, 
  Pencil, 
  UserCog, 
  Trash2, 
  AlertOctagon, 
  RefreshCw 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ActionMenuProps {
  isActive: boolean;
  onChangeRole: () => void;
  onUpdate: () => void;
  onSuspendToggle: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function ActionMenu({
  isActive,
  onChangeRole,
  onUpdate,
  onSuspendToggle,
  onDelete,
  isLoading
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
        <DropdownMenuItem onClick={onChangeRole} className="cursor-pointer">
          <UserCog className="mr-2 h-4 w-4" />
          <span>Change Role</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUpdate} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          <span>Update Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSuspendToggle} className="cursor-pointer">
          {isActive ? (
            <>
              <AlertOctagon className="mr-2 h-4 w-4 text-amber-500" />
              <span>Suspend</span>
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4 text-green-500" />
              <span>Restore</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}