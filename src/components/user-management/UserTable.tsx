"use client";
import { useState, useEffect } from "react";
import UserModal from "../modals/UserModal";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
  dob: string | null;
  gender: string | null;
};

type Pagination = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
};

type ApiResponse = {
  status: string;
  message: {
    count: number;
    total_users: number;
    users: {
      current_page: number;
      data: User[];
      per_page: number;
      total: number;
      last_page: number;
      first_page_url: string;
      last_page_url: string;
      next_page_url: string | null;
      prev_page_url: string | null;
    };
  };
  data: string;
};

type UserTableProps = {
  currentPage: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
};

export default function UserTable({ currentPage, perPage, onPageChange }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Omit<Pagination, 'currentPage' | 'perPage'>>({
    total: 0,
    lastPage: 1,
  });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("collo-admin-token");
      if (!token) {
        setError("No token found in localStorage");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/admin/customer?page=${currentPage}&perPage=${perPage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        setUsers(result.message.users.data);
        setPagination({
          total: result.message.users.total,
          lastPage: result.message.users.last_page,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, perPage, API_BASE_URL]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      onPageChange(newPage);
    }
  };

  if (loading) return <div className="mt-4">Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm text-gray-500">{user.id}</td>
                <td
                  className="px-6 py-4 text-sm font-medium text-gray-600 cursor-pointer hover:underline"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.phone_number}</td>
                <td className="px-6 py-4 text-sm">
                  <button 
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * perPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * perPage, pagination.total)}
          </span>{" "}
          of <span className="font-medium">{pagination.total}</span> users
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.lastPage}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {selectedUserId && (
        <UserModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}
    </div>
  );
}