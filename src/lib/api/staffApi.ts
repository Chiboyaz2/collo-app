/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { AdminRole, Admin, PaginatedAdmins } from '@/types/staff';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper to get the auth token
const getAuthToken = (): string => { 
  const token = localStorage.getItem('collo-admin-token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

// Fetch admin roles
export const fetchAdminRoles = async (): Promise<AdminRole[]> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/admin-roles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch admin roles');
  }

  const result = await response.json();
  
  if (result.status === 'success' && Array.isArray(result.message)) {
    return result.message;
  } else {
    throw new Error('Invalid admin roles data');
  }
};

// Fetch admins with filtering and pagination
export const fetchAdmins = async ({
  roleId = '',
  page = 1,
  perPage = 10
}: {
  roleId?: number | '';
  page?: number;
  perPage?: number;
}): Promise<PaginatedAdmins> => {
  const token = getAuthToken();
  
  const roleParam = roleId !== '' ? `admin_role=${roleId}` : '';
  const url = `${API_BASE_URL}/superadmin/admin?${roleParam}&perPage=${perPage}&page=${page}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch admins');
  }

  const result = await response.json();
  
  if (result.status === 'success') {
    return result.message.admins;
  } else {
    throw new Error('Invalid admins data');
  }
};

// Create new staff
export const createStaff = async (staffData: {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  admin_role: number;
  user_role: 1;
}): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/superadmin/admin/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create staff');
  }
};

// Change admin role
export const changeAdminRole = async (
  adminId: number,
  roleData: { user_role: 1; admin_role: number }
): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/superadmin/admin/change-role/${adminId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to change role');
  }
};

// Update admin details
export const updateAdmin = async (
  updateData: {
    first_name: string;
    last_name: string;
    phone_number: string;
  }
): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/update-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update admin');
  }
};

// Delete admin
export const deleteAdmin = async (adminId: number): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/superadmin/admin/delete/${adminId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete admin');
  }
};

// Suspend admin
export const suspendAdmin = async (adminId: number, suspend: boolean): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/superadmin/admin/suspend/${adminId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ suspend }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update suspension status');
  }
};

// Restore admin
export const restoreAdmin = async (adminId: number): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/superadmin/admin/restore/${adminId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ id: adminId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to restore admin');
  }
};