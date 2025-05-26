"use client"

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateStaffModal from '@/components/modals/CreateStaffModal';
import { AdminRole } from '@/types/staff';
import { createStaff } from '@/lib/api/staffApi';

interface FilterBarProps {
  adminRoles: AdminRole[];
  selectedRoleId: number | '';
  onRoleChange: (value: number | '') => void;
  isLoading: boolean;
  onSuccess: (message: string) => void;
}

export function FilterBar({ 
  adminRoles, 
  selectedRoleId, 
  onRoleChange, 
  isLoading,
  onSuccess
}: FilterBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateStaff = async (staffData: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    admin_role: number;
    user_role: 1;
  }) => {
    setIsCreating(true);
    try {
      await createStaff(staffData);
      setIsModalOpen(false);
      onSuccess('Staff created successfully!');
    } catch (error) {
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="w-full sm:w-auto relative z-50">
        <Select
          value={selectedRoleId === '' ? 'all' : selectedRoleId.toString()}
          onValueChange={(value) => onRoleChange(value === 'all' ? '' : Number(value))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg">
            <SelectItem value="all">All Roles</SelectItem>
            {adminRoles.map((role) => (
              <SelectItem key={role.id} value={role.id.toString()}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={() => setIsModalOpen(true)}
        className="w-full sm:w-auto cursor-pointer"
        disabled={isLoading}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Staff
      </Button>

      <CreateStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStaff}
        adminRoles={adminRoles}
        isLoading={isCreating}
      />
    </div>
  );
}