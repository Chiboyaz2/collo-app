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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
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
        let url = `${API_BASE_URL}/admin/customer?page=${currentPage}&perPage=${perPage}`;
        
        if (activeSearchQuery) {
          url += `&search=${encodeURIComponent(activeSearchQuery)}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

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
  }, [currentPage, perPage, API_BASE_URL, activeSearchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      onPageChange(newPage);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery);
    // Reset to first page when searching
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    // Reset to first page when clearing search
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mt-4"></div>; 
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {activeSearchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-white cursor-pointer absolute right-20 bottom-1.5 bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="text-white cursor-pointer absolute right-2.5 bottom-1.5 bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-xs px-3 py-1"
          >
            Search
          </button>
        </div>
      </form>

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
                    className="text-[#470B96] hover:text-[#470B96]/80 cursor-pointer"
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
            className="px-4 py-2 border rounded disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.lastPage}
            className="px-4 py-2 border rounded disabled:opacity-50 cursor-pointer"
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