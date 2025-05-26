"use client"

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Admin, AdminRole } from '@/types/staff';
import { ActionMenu } from './ActionMenu';
import { ChangeRoleModal } from '@/components/modals/ChangeRoleModal';
import { UpdateStaffModal } from '@/components/modals/UpdateStaffModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { suspendAdmin, restoreAdmin } from '@/lib/api/staffApi';

interface StaffTableRowProps {
  admin: Admin;
  adminRoles: AdminRole[];
  onSuccess: (message: string) => void;
}

export function StaffTableRow({ admin, adminRoles, onSuccess }: StaffTableRowProps) {
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const role = adminRoles.find(r => r.id === admin.admin_role_id);
  const isActive = admin.status === 'active' && admin.is_suspended === 0;

  const handleSuspendToggle = async () => {
    setIsLoading(true);
    try {
      if (isActive) {
        await suspendAdmin(admin.id, true);
        onSuccess('Admin suspended successfully!');
      } else {
        await restoreAdmin(admin.id);
        onSuccess('Admin restored successfully!');
      }
    } catch (error) {
      console.error('Error updating suspension status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-medium">{admin.id}</TableCell>
        <TableCell>{admin.first_name} {admin.last_name}</TableCell>
        <TableCell className="max-w-[200px] truncate">{admin.email}</TableCell>
        <TableCell>{admin.phone_number}</TableCell>
        <TableCell>{role?.name || 'Unknown'}</TableCell>
        <TableCell>
          <Badge variant={isActive ? "success" : "destructive"} className="capitalize">
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <ActionMenu
            isActive={isActive}
            onChangeRole={() => setIsChangeRoleModalOpen(true)}
            onUpdate={() => setIsUpdateModalOpen(true)}
            onSuspendToggle={handleSuspendToggle}
            onDelete={() => setIsDeleteModalOpen(true)}
            isLoading={isLoading}
          />
        </TableCell>
      </TableRow>

      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        admin={admin}
        adminRoles={adminRoles}
        onSuccess={onSuccess}
      />

      <UpdateStaffModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        admin={admin}
        onSuccess={onSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        admin={admin}
        onSuccess={onSuccess}
      />
    </>
  );
}