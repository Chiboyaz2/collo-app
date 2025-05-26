/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from 'react';
import { StaffTable } from '@/components/staff/StaffTable';
import { FilterBar } from '@/components/staff/FilterBar';
import { fetchAdminRoles, fetchAdmins } from '@/lib/api/staffApi';
import { AdminRole, Admin, PaginationState } from '@/types/staff';
import { useToast } from '@/hooks/use-toast';

export default function Staff() {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRoles, setIsFetchingRoles] = useState(false);
  const [isFetchingAdmins, setIsFetchingAdmins] = useState(false);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    perPage: 5,
    lastPage: 1,
    total: 0,
  });
  const { toast } = useToast();

  // Fetch admin roles on component mount
  useEffect(() => {
    const loadAdminRoles = async () => {
      setIsFetchingRoles(true);
      try {
        const roles = await fetchAdminRoles();
        setAdminRoles(roles);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to fetch admin roles',
          variant: "destructive"
        });
      } finally {
        setIsFetchingRoles(false);
      }
    };

    loadAdminRoles();
  }, [toast]);

  // Fetch admins when filters or pagination changes
  useEffect(() => {
    const loadAdmins = async () => {
      setIsFetchingAdmins(true);
      try {
        const result = await fetchAdmins({
          roleId: selectedRoleId,
          page: pagination.currentPage,
          perPage: pagination.perPage
        });
        
        setAdmins(result.data);
        setPagination(prev => ({
          ...prev,
          lastPage: result.last_page,
          total: result.total
        }));
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to fetch admins',
          variant: "destructive"
        });
      } finally {
        setIsFetchingAdmins(false);
      }
    };

    loadAdmins();
  }, [selectedRoleId, pagination.currentPage, pagination.perPage, toast]);

  // Event handlers
  const handleRoleChange = (value: number | '') => {
    setSelectedRoleId(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
    // Refresh admin list on first page
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="space-y-6 p-6 ">
      <h1 className="text-2xl font-bold">Staff Management</h1>
      
      <FilterBar
        adminRoles={adminRoles} 
        selectedRoleId={selectedRoleId}
        onRoleChange={handleRoleChange}
        isLoading={isFetchingRoles}
        onSuccess={handleSuccess}
      />

      <StaffTable
        admins={admins}
        adminRoles={adminRoles}
        pagination={pagination}
        isLoading={isLoading || isFetchingAdmins}
        onPageChange={handlePageChange}
        onSuccess={handleSuccess}
      />
    </div>
  );
}