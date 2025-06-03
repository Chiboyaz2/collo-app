import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  user_id: number;
  allocation_paused: number;
  mgr_id: string;
  role: string;
  position: number;
  status: number;
  join_date: string;
  created_at: string;
  updated_at: string;
  is_kicked_out: number;
  rollover: number;
}

interface GetUserModalProps {
  open: boolean;
  onClose: () => void;
  mgrId: string;
  mgrName: string; // This is properly defined in the interface
}

// Added mgrName to the destructured props here
const GetUserModal: React.FC<GetUserModalProps> = ({ open, onClose, mgrId, mgrName }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get data from localStorage
        const dateRange = localStorage.getItem('collo-calendar-date-range');
        const token = localStorage.getItem('collo-admin-token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        let startDate = '01/01/2025';
        let endDate = '06/01/2025';
        
        if (dateRange) {
          const { startDate: storedStart, endDate: storedEnd } = JSON.parse(dateRange);
          startDate = storedStart;
          endDate = storedEnd;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
        const url = `${baseUrl}/admin/finance/mgr/users?start_date=${startDate}&end_date=${endDate}&perPage=10&mgrId=${mgrId}`;

        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token.replace(/"/g, '')}`);

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow" as const
        };

        const response = await fetch(url, requestOptions);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch users');
        }

        setUsers(result.data.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open, mgrId]);

  if (!open) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusText = (status: number) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  const getBooleanText = (value: number) => {
    return value === 1 ? 'Yes' : 'No';
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-lg">
        {/* Modal header */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{mgrName} Users</h3>
        </div>
        
        {/* Modal content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="text-center">Loading users...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center">No users found for this MGR</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation Paused</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kicked Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rollover</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatusText(user.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.join_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getBooleanText(user.allocation_paused)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getBooleanText(user.is_kicked_out)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getBooleanText(user.rollover)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Modal footer */}
        <div className="flex justify-end p-4 border-t">
          <Button 
            onClick={onClose}
            variant="outline"
            className="mt-4 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GetUserModal;