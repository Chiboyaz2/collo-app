/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import MgrPlansModal from "./MgrPlansModal";
import DefaultsModal from "./DefaultsModal";
import ReconciliationModal from "./ReconciliationModal";

type VirtualAccount = {
  id: number;
  user_id: number;
  account_number: string;
  account_first_name: string;
  account_last_name: string;
  bank_name: string;
  account_balance: string;
  account_id: string;
  client: string;
  client_id: string;
  savings_product_name: string;
  bvn: string;
  created_at: string;
  updated_at: string;
};

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
  created_at: string | null;
  virtual_account: VirtualAccount | null;
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
  const [showMgrPlans, setShowMgrPlans] = useState<boolean>(false);
  const [showDefaults, setShowDefaults] = useState<boolean>(false);
  const [showReconciliation, setShowReconciliation] = useState<boolean>(false);

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
        console.log("User details with virtual_account:", data.message);
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
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReconciliationSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  function formatDate(dateString: string | null): string {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 shadow-lg w-full max-w-lg fixed top-0 right-0 h-screen md:w-[3500px]"
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
              <div>
                <p className="font-medium">Virtual Account:</p>
                <p>{userDetails.virtual_account ? "Available" : "Not Available"}</p>
              </div>
              <div>
                <p className="font-medium">Created Date:</p>
                <p>{formatDate(userDetails.created_at)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowMgrPlans(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer"
              >
                Get MGR Plans
              </button>
              <button
                onClick={() => setShowDefaults(true)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded cursor-pointer"
              >
                See Defaults
              </button>
              <button
                onClick={() => setShowReconciliation(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer"
              >
                Reconciliation
              </button>
            </div>
          </div>
        ) : (
          <p>No user data found.</p>
        )}
      </div>

      {/* Render the modals conditionally */}
      {showMgrPlans && (
        <MgrPlansModal 
          userId={userId} 
          onClose={() => setShowMgrPlans(false)} 
        />
      )}
      
      {showDefaults && (
        <DefaultsModal 
          userId={userId} 
          onClose={() => setShowDefaults(false)} 
        />
      )}
      
      {showReconciliation && userDetails && (
        <ReconciliationModal 
          userId={userId}
          virtualAccount={userDetails.virtual_account} // Fix: Pass the value directly, not optional chaining
          onClose={() => setShowReconciliation(false)}
          onSuccess={handleReconciliationSuccess}
        />
      )}
    </div>
  );
}