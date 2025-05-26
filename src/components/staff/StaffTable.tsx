"use client"

import { StaffTableRow } from '@/components/staff/StaffTableRow';
import { TablePagination } from '@/components/staff/TablePagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminRole, Admin, PaginationState } from '@/types/staff';

interface StaffTableProps {
  admins: Admin[];
  adminRoles: AdminRole[];
  pagination: PaginationState;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSuccess: (message: string) => void;
}

export function StaffTable({
  admins,
  adminRoles,
  pagination,
  isLoading,
  onPageChange,
  onSuccess
}: StaffTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table >
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading staff data...
                </TableCell>
              </TableRow>
            )}
            
            {!isLoading && admins.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
            
            {!isLoading && admins.map((admin) => (
              <StaffTableRow
                key={admin.id}
                admin={admin}
                adminRoles={adminRoles}
                onSuccess={onSuccess}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination.total > 0 && (
        <TablePagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          total={pagination.total}
          onPageChange={onPageChange}
          isLoading={isLoading}
          itemsShown={admins.length}
        />
      )}
    </div>
  );
}