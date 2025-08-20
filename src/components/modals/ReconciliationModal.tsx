/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";

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

type ReconciliationModalProps = {
  userId: number;
  virtualAccount: VirtualAccount | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export default function ReconciliationModal({
  userId,
  virtualAccount,
  onClose,
  onSuccess,
}: ReconciliationModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !reason) {
      setError("Amount and reason are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("collo-admin-token");
      if (!token) throw new Error("No token found in localStorage");

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const virtualAccountId = virtualAccount?.id;

      const formdata = new FormData();
      formdata.append("virtual_account_id", virtualAccountId!.toString());
      formdata.append("amount", amount);
      formdata.append("reason", reason);

      const response = await fetch(
        `${API_BASE_URL}/admin/finance/customer/wallet/add-balance`,
        {
          method: "POST",
          headers: myHeaders,
          body: formdata,
        }
      );

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${responseText}`
        );
      }

      const result = JSON.parse(responseText);

      if (result.status === "success") {
        onSuccess(
          result.data || "Wallet balance addition request submitted for approval."
        );
        onClose();
      } else {
        throw new Error(result.message || "Failed to process reconciliation");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process reconciliation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#470B96] mb-6 text-center">
          Reconciliation
        </h2>

        {virtualAccount ? (
          <>
            <div className="mb-6 p-4 bg-[#F8F5FF] border border-[#470B96]/30 rounded-lg">
              <p className="font-semibold text-[#470B96]">Virtual Account</p>
              <p className="text-gray-700">
                {virtualAccount.account_first_name}{" "}
                {virtualAccount.account_last_name}
              </p>
              <p className="text-gray-700">Number: {virtualAccount.account_number}</p>
              <p className="text-gray-700">Bank: {virtualAccount.bank_name}</p>
              <p className="text-gray-700 font-medium">
                Balance: ₦
                {parseFloat(virtualAccount.account_balance).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ID: {virtualAccount.id}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border rounded-lg border-gray-300 focus:border-[#470B96] focus:ring-[#470B96] focus:ring-1 outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border rounded-lg border-gray-300 focus:border-[#470B96] focus:ring-[#470B96] focus:ring-1 outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-[#470B96] text-white hover:bg-[#5f1bbf] transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Processing..." : "Submit"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-6 text-center">
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-yellow-800">
                No Virtual Account Found
              </p>
              <p className="text-yellow-700 text-sm">
                This user does not have a virtual account. <br />
                Reconciliation cannot be performed.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
