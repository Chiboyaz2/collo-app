import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface VirtualAccount {
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
}

interface ApiResponse {
  status: string;
  message: {
    current_page: number;
    data: VirtualAccount[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  data: string;
}

interface VirtualAccountsProps {
  startDate: Date;
  endDate: Date;
}

const VirtualAccounts: React.FC<VirtualAccountsProps> = ({ startDate, endDate }) => {
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const perPage = 6;

  // Get base URL from environment variables
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    fetchAccounts();
  }, [startDate, endDate, currentPage,]);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('collo-admin-token');
    }
    return null;
  };

  const fetchAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formattedStartDate = format(startDate, 'MM/dd/yyyy');
      const formattedEndDate = format(endDate, 'MM/dd/yyyy');

      const response = await fetch(
        `${API_BASE_URL}/admin/finance/accounts/virtual?start_date=${formattedStartDate}&end_date=${formattedEndDate}&page=${currentPage}&perPage=${perPage}`,
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
      
      if (result.status !== 'success') {
        throw new Error(result.data || 'Failed to fetch accounts');
      }

      setAccounts(result.message.data);
      setTotalPages(result.message.last_page);
    } catch (error) {
      console.error('Error fetching virtual accounts:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-3 py-2 text-gray-500">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-md ${currentPage === i ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-3 py-2 text-gray-500">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </button>
        
        <div className="flex space-x-2">
          {pages}
        </div>
        
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className=" mt-4">
      <p className="text-gray-600 mb-6">
        Showing virtual accounts from {format(startDate, 'MMM d, yyyy')} to {format(endDate, 'MMM d, yyyy')}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {accounts.length === 0 && !error ? (
            <div className="text-center py-10 text-gray-500">
              No virtual accounts found for the selected date range
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <div key={account.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {account.account_first_name} {account.account_last_name}
                          </h3>
                          <p className="text-sm text-gray-500">{account.bank_name}</p>
                        </div>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          #{account.id}
                        </span>
                      </div>

                      <div className="space-y-3 grid md:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-500">Account Number</p>
                          <p className="font-medium">{account.account_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Balance</p>
                          <p className="font-bold text-lg text-purple-600">
                            {parseFloat(account.account_balance).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Client</p>
                          <p className="font-medium">{account.client}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium">
                            {format(new Date(account.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {renderPagination()}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default VirtualAccounts;