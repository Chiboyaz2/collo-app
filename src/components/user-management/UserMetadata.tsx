"use client";
import { useState, useEffect } from "react";

type UserMetadata = {
  total_users: number;
  active_users: number;
  verified_users: number;
  inactive_users: number;
  new_users: number;
  growth_rate: number;
};

export default function UserMetadata() {
  const [metadata, setMetadata] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchMetadata = async () => {
      const token = localStorage.getItem("collo-admin-token");
      if (!token) {
        setError("No token found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/customer/metadata`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setMetadata(result.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [API_BASE_URL]);

  if (loading) return <div>Loading metadata...</div>;
  // if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!metadata) return null;

  return (
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
        <p className="text-3xl font-bold mt-2">
        {Number.parseFloat(metadata.growth_rate.toString()).toFixed(3)} %
          </p>
        <p className="text-sm text-gray-500 mt-1">User base growth</p>
      </div>
    </div>
  );
}