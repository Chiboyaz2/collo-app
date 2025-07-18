"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

type MgrPlan = {
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
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  mgr: {
    id: string;
    creator_id: number;
    name: string;
    desc: string;
    duration: string;
    number_of_members: number;
    amount: number;
    currency: string;
    join_date_deadline: string;
    contribution_start_date: string;
    current_cycle_number: number;
    allocation_date: string;
    theme_color: string;
    allotment_type: string;
    invite_link: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
};

type MgrPlansModalProps = {
  userId: number;
  onClose: () => void;
};

export default function MgrPlansModal({ userId, onClose }: MgrPlansModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<MgrPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchMgrPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("collo-admin-token");
      if (!token) throw new Error("No token found in localStorage");

      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const url = new URL(`${API_BASE_URL}/admin/finance/mgr/users`);
      url.searchParams.append("userId", userId.toString());
      url.searchParams.append("perPage", "10");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch MGR plans");
      }

      const result = await response.json();
      setPlans(result.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch MGR plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMgrPlans();
  }, [userId]);

  const handleRefresh = () => {
    fetchMgrPlans();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusText = (status: number) => {
    return status === 0 ? "Active" : "Inactive";
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl cursor-pointer"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">MGR Plans for User ID: {userId}</h2>
        
        <div className="mb-6">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading MGR plans...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : plans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MGR Name</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 border-b text-sm text-gray-900">{plan.mgr?.name || "N/A"}</td>
                    <td className="py-4 px-4 border-b text-sm text-gray-900 capitalize">{plan.role}</td>
                    <td className="py-4 px-4 border-b text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        plan.status === 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {getStatusText(plan.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 border-b text-sm text-gray-900">{formatDate(plan.join_date)}</td>
                    <td className="py-4 px-4 border-b text-sm text-gray-900">
                      {plan.allocation_paused === 0 ? "Active" : "Paused"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No MGR plans found for this user.</p>
        )}
      </div>
    </div>
  );
}