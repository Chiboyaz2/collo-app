"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

type DefaultRecord = {
  id: string;
  mgr_cycle_id: string;
  mgr_id: string;
  user_id: number;
  in_grace_period: number;
  is_paid: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  mgr: {
    id: string;
    name: string;
  };
};

type DefaultsModalProps = {
  userId: number;
  onClose: () => void;
};

export default function DefaultsModal({ userId, onClose }: DefaultsModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [defaults, setDefaults] = useState<DefaultRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const itemsPerPage = 10;

  const fetchDefaults = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("collo-admin-token");
      if (!token) throw new Error("No token found in localStorage");

      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const url = new URL(`${API_BASE_URL}/admin/finance/mgr/default`);
      url.searchParams.append("userId", userId.toString());
      url.searchParams.append("perPage", itemsPerPage.toString());
      url.searchParams.append("page", page.toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch defaults");
      }

      const result = await response.json();
      setDefaults(result.data.data || []);
      setTotalPages(result.data.last_page || 1);
      setTotalItems(result.data.total || 0);
      setCurrentPage(result.data.current_page || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch defaults");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaults();
  }, [userId]);

  const handleRefresh = () => {
    fetchDefaults(currentPage);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchDefaults(page);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const getStatusText = (isPaid: number, inGracePeriod: number) => {
    if (isPaid === 1) return "Paid";
    if (inGracePeriod === 1) return "Grace Period";
    return "Defaulted";
  };

  const getStatusColor = (isPaid: number, inGracePeriod: number) => {
    if (isPaid === 1) return "bg-green-100 text-green-800";
    if (inGracePeriod === 1) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl cursor-pointer"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">Defaults for User ID: {userId}</h2>
        
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
          <div className="text-sm text-gray-600">
            Showing {defaults.length} of {totalItems} records
          </div>
        </div>

        {loading ? (
          <p>Loading defaults data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : defaults.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white ">
                <thead className="bg-gray-50">
                  <tr>
                    {/* <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default ID</th> */}
                    <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MGR Name</th>
                    {/* <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MGR ID</th> */}
                    {/* <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle ID</th> */}
                    <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {defaults.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      {/* <td className="py-4 px-4 border-b text-sm text-gray-900">{record.id}</td> */}
                      <td className="py-4 px-4 border-b text-sm text-gray-900">{record.mgr?.name || 'N/A'}</td>
                      {/* <td className="py-4 px-4 border-b text-sm text-gray-900">{record.mgr_id}</td> */}
                      {/* <td className="py-4 px-4 border-b text-sm text-gray-900">{record.mgr_cycle_id}</td> */}
                      <td className="py-4 px-4 border-b text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.is_paid, record.in_grace_period)}`}>
                          {getStatusText(record.is_paid, record.in_grace_period)}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-b text-sm text-gray-900">{formatDate(record.created_at)}</td>
                      <td className="py-4 px-4 border-b text-sm text-gray-900">{formatDate(record.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">No defaults found for this user.</p>
        )}
      </div>
    </div>
  );
}