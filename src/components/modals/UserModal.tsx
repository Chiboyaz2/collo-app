"use client";
import { useEffect, useState } from "react";

type UserDetails = {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  dob: string | null;
  gender: string | null;
  email: string;
  phone_number: string;
  address: string | null;
  occupation: string | null;
  kyc_status: number;
  bvn_verification_status: number;
  nin_verification_status: number;
  is_suspended: boolean;
};

type ModalProps = {
  userId: number;
  onClose: () => void;
};

export default function UserModal({ userId, onClose }: ModalProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("collo-admin-token");
        if (!token) throw new Error("No token found in localStorage");

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${token}`);

        const res = await fetch(
          `${API_BASE_URL}/admin/customer/${userId}`,
          { method: "GET", headers }
        );

        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorData}`);
        }

        const data = await res.json();
        setUserDetails(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [API_BASE_URL, userId]);

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const token = localStorage.getItem("collo-admin-token");
      if (!token) throw new Error("No token found in localStorage");

      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${API_BASE_URL}/admin/customer/delete/${userId}`,
        { method: "DELETE", headers }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      setSuccessMessage(result.data || "User deleted successfully");
      
      // Reload the page after 2 seconds to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          ✕
        </button>

        {loading ? (
          <p>Loading user details...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : userDetails ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {userDetails.first_name} {userDetails.last_name}
            </h2>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {successMessage}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-medium">Email:</p>
                <p>{userDetails.email}</p>
              </div>
              <div>
                <p className="font-medium">Phone:</p>
                <p>{userDetails.phone_number}</p>
              </div>
              <div>
                <p className="font-medium">Gender:</p>
                <p>{userDetails.gender || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Date of Birth:</p>
                <p>{userDetails.dob || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Occupation:</p>
                <p>{userDetails.occupation || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Address:</p>
                <p>{userDetails.address || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">KYC Status:</p>
                <p>{userDetails.kyc_status === 1 ? "Verified" : "Not Verified"}</p>
              </div>
              <div>
                <p className="font-medium">BVN Status:</p>
                <p>{userDetails.bvn_verification_status === 1 ? "Verified" : "Not Verified"}</p>
              </div>
              <div>
                <p className="font-medium">NIN Status:</p>
                <p>{userDetails.nin_verification_status === 1 ? "Verified" : "Not Verified"}</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
              {/* <button
                disabled={actionLoading}
                className={`px-4 py-2 rounded ${userDetails.is_suspended 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-yellow-500 hover:bg-yellow-600"} text-white disabled:opacity-50`}
              >
                {actionLoading ? "Processing..." : userDetails.is_suspended ? "Unsuspend" : "Suspend"}
              </button> */}
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Processing..." : "Delete User"}
              </button>
            </div>
          </div>
        ) : (
          <p>No user data found.</p>
        )}
      </div>
    </div>
  );
}