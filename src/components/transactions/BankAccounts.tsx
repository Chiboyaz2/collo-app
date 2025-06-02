import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface BankAccount {
  id: number;
  user_id: number;
  bank_name: string;
  bank_code: string;
  account_number: string;
  transfer_type: string;
  status: number;
  primary: number;
  holder_name: string;
  currency: string;
  client_id: string;
  bvn: string;
  account_id: string;
  provider_status: string;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  current_page: number;
  data: BankAccount[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface ApiResponse {
  status: string;
  message: PaginationData;
  data: string;
}

interface BankAccountsProps {
  startDate: Date;
  endDate: Date;
}

const BankAccounts: React.FC<BankAccountsProps> = ({ startDate, endDate }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const token = localStorage.getItem('collo-admin-token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const formattedStartDate = format(startDate, 'MM/dd/yyyy');
        const formattedEndDate = format(endDate, 'MM/dd/yyyy');

        const response = await fetch(
          `${API_BASE_URL}/admin/finance/accounts/bank?start_date=${formattedStartDate}&end_date=${formattedEndDate}&page=${currentPage}&perPage=6`,
          {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        setBankAccounts(result.message.data);
        setPagination(result.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccounts();
  }, [startDate, endDate, currentPage, API_BASE_URL]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
  );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-4">
        Showing bank accounts data from {format(startDate, 'MMM d, yyyy')} to {format(endDate, 'MMM d, yyyy')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankAccounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{account.bank_name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                account.provider_status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {account.provider_status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Account Holder</p>
                <p className="font-medium">{account.holder_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-mono font-medium">{account.account_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bank Code</p>
                  <p>{account.bank_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p>{account.currency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Transfer Type</p>
                  <p className="capitalize">{account.transfer_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Primary</p>
                  <p>{account.primary ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500">Created</p>
                <p>{format(new Date(account.created_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bankAccounts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No bank accounts found for the selected date range.
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > pagination.per_page && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md border border-gray-300 ${
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Previous
            </button>

            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border-t border-b border-gray-300 ${
                  page === currentPage
                    ? 'bg-blue-50 text-blue-600 border-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.last_page}
              className={`px-3 py-1 rounded-r-md border border-gray-300 ${
                currentPage === pagination.last_page
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {pagination && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Showing {pagination.from} to {pagination.to} of {pagination.total} entries
        </div>
      )}
    </div>
  );
};

export default BankAccounts;