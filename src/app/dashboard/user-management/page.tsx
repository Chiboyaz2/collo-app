"use client";
import { useState, useEffect } from "react";
import UserModal from "../../../components/modals/UserModal";

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

type UserMetadata = {
  total_users: number;
  active_users: number;
  verified_users: number;
  inactive_users: number;
  new_users: number;
  growth_rate: number;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<UserMetadata | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    perPage: 5,
    total: 0,
    lastPage: 1,
  });

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;



  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("collo-admin-token");
      if (!token) {
        setError("No token found in localStorage");
        setLoading(false);
        setMetadataLoading(false);
        return;
      }

      try {
        // Fetch metadata
        setMetadataLoading(true);
        const metadataResponse = await fetch(
          `${API_BASE_URL}/admin/customer/metadata`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!metadataResponse.ok) {
          throw new Error(`HTTP error! status: ${metadataResponse.status}`);
        }

        const metadataResult = await metadataResponse.json();
        setMetadata(metadataResult.message);

        // Fetch users
        setLoading(true);
        const usersResponse = await fetch(
          `${API_BASE_URL}/admin/customer?page=${pagination.currentPage}&perPage=${pagination.perPage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!usersResponse.ok) {
          throw new Error(`HTTP error! status: ${usersResponse.status}`);
        }

        const usersResult: ApiResponse = await usersResponse.json();
        setUsers(usersResult.message.users.data);
        setPagination({
          currentPage: usersResult.message.users.current_page,
          perPage: usersResult.message.users.per_page,
          total: usersResult.message.users.total,
          lastPage: usersResult.message.users.last_page,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
        setMetadataLoading(false);
      }
    };

    fetchData();
  }, [pagination.currentPage, pagination.perPage, API_BASE_URL]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  if (loading || metadataLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Metadata Cards Grid */}
      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold mt-2">{metadata.total_users}</p>
            <p className="text-sm text-gray-500 mt-1">All registered users</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700">Active Users</h3>
            <p className="text-3xl font-bold mt-2">{metadata.active_users}</p>
            <p className="text-sm text-gray-500 mt-1">Currently active</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-700">Verified Users</h3>
            <p className="text-3xl font-bold mt-2">{metadata.verified_users}</p>
            <p className="text-sm text-gray-500 mt-1">Completed verification</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-700">New Users</h3>
            <p className="text-3xl font-bold mt-2">{metadata.new_users}</p>
            <p className="text-sm text-gray-500 mt-1">Recently registered</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-gray-700">Inactive Users</h3>
            <p className="text-3xl font-bold mt-2">{metadata.inactive_users}</p>
            <p className="text-sm text-gray-500 mt-1">Not recently active</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
            <h3 className="text-lg font-semibold text-gray-700">Growth Rate</h3>
            <p className="text-3xl font-bold mt-2">{metadata.growth_rate}%</p>
            <p className="text-sm text-gray-500 mt-1">User base growth</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white p-6 rounded-lg shadow">
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
              {(pagination.currentPage - 1) * pagination.perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
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