import React, { useEffect, useState } from 'react';

// Define interfaces for the data structure
interface User {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  dob: string | null;
  gender: string;
  marital_status: string | null;
  email: string;
  email_verified_at: string | null;
  is_system_placeholder: number;
  profile_completed: number;
  phone_number: string;
  phone_verified_at: string | null;
  id_number: string | null;
  id_type: string | null;
  address: string | null;
  nearest_landmark: string | null;
  lga: string | null;
  state: string;
  nationality: string;
  home_town: string | null;
  occupation: string | null;
  employer: string | null;
  employer_address: string | null;
  nok_name: string | null;
  nok_phone_number: string | null;
  nok_email: string | null;
  nok_address: string | null;
  nok_relationship: string | null;
  pin_attempts: number;
  pin_locked_until: string | null;
  pin_set_at: string | null;
  referral_code: string | null;
  kyc_status: number;
  nin_verification_status: number;
  bvn_verification_status: number;
  created_at: string;
  updated_at: string;
  signup_referral_code: string | null;
  nin_data: string | null;
  deleted_at: string | null;
}

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
  user: User;
}

interface ReconciliationRequest {
  id: number;
  activity_log_id: number;
  virtual_account_id: number;
  amount: string;
  balance_before: string;
  balance_after: string;
  updater_id: number;
  approver_id: number | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  updater: User;
  virtual_account: VirtualAccount;
}

interface ApiResponse {
  status: string;
  message: {
    current_page: number;
    data: ReconciliationRequest[];
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
  };
  data: string;
}

interface ApprovalResponse {
  status: string;
  message: {
    reconciliation: ReconciliationRequest;
    virtual_account: VirtualAccount;
  };
  data: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const Reconciliation = () => {
  const [requests, setRequests] = useState<ReconciliationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ReconciliationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<ReconciliationRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, activeTab]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchRequests = async (status?: string): Promise<void> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem('collo-admin-token') : null;
      
      console.log('Base URL:', baseUrl);
      console.log('Token:', token);

      if (!baseUrl) {
        throw new Error('API base URL is not defined');
      }

      if (!token) {
        throw new Error('Authentication token is not available');
      }

      const url = status 
        ? `${baseUrl}/admin/finance/customer/wallet/requests?status=${status}`
        : `${baseUrl}/admin/finance/customer/wallet/requests`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      setRequests(result.message.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = (): void => {
    if (activeTab === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(request => request.status === activeTab));
    }
  };

  const handleTabClick = (tab: StatusFilter): void => {
    setActiveTab(tab);
    setLoading(true);
    
    if (tab === 'all') {
      fetchRequests();
    } else {
      fetchRequests(tab);
    }
  };

  const handleApprove = (request: ReconciliationRequest): void => {
    setSelectedRequest(request);
    setActionType('approve');
    setShowModal(true);
  };

  const handleReject = (request: ReconciliationRequest): void => {
    setSelectedRequest(request);
    setActionType('reject');
    setShowModal(true);
  };

  const confirmAction = async (): Promise<void> => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem('collo-admin-token') : null;

      if (!baseUrl || !token) {
        throw new Error('API configuration error');
      }

      const url = `${baseUrl}/admin/finance/customer/wallet/approve-addition/${selectedRequest.id}?verdict=${actionType === 'approve' ? 'approved' : 'rejected'}`;
      
      const formData = new FormData();
      formData.append('virtual_account_id', selectedRequest.virtual_account_id.toString());
      formData.append('amount', selectedRequest.amount);
      formData.append('reason', selectedRequest.reason);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApprovalResponse = await response.json();
      
      // Update the request in the state - FIXED: Use proper type for status
      const updatedRequests = requests.map(request => 
        request.id === selectedRequest.id 
          ? { 
              ...request, 
              status: actionType === 'approve' ? 'approved' as const : 'rejected' as const,
              approver_id: 1 // Assuming the current user ID is 1
            } 
          : request
      );
      
      setRequests(updatedRequests);
      setSuccessMessage(
        `Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully! ` +
        `Amount: ₦${result.message.reconciliation.amount}, ` +
        `New Balance: ₦${result.message.virtual_account.account_balance}`
      );
      
      setShowModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error processing request:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTabClass = (tab: StatusFilter): string => {
    return `px-4 py-2 text-sm font-medium rounded-t-lg ${
      activeTab === tab 
        ? 'bg-white text-blue-600 border border-b-0 border-gray-200' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reconciliation Requests</h1>
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Success: </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 right-0 p-3" 
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-2">
          <button 
            className={getTabClass('all')}
            onClick={() => handleTabClick('all')}
          >
            All
          </button>
          <button 
            className={getTabClass('pending')}
            onClick={() => handleTabClick('pending')}
          >
            Pending
          </button>
          <button 
            className={getTabClass('approved')}
            onClick={() => handleTabClick('approved')}
          >
            Approved
          </button>
          <button 
            className={getTabClass('rejected')}
            onClick={() => handleTabClick('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updater</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.updater.first_name} {request.updater.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{request.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600/70 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-lg shadow-lg">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to {actionType} this reconciliation request?
                </p>
                {selectedRequest && (
                  <div className="mt-4 text-left p-4 bg-gray-50 rounded-md">
                    <p><strong>ID:</strong> {selectedRequest.id}</p>
                    <p><strong>Updater:</strong> {selectedRequest.updater.first_name} {selectedRequest.updater.last_name}</p>
                    <p><strong>Amount:</strong> ₦{selectedRequest.amount}</p>
                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 px-4 py-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={processing}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={processing}
                  className={`px-4 py-2 rounded text-white disabled:opacity-50 ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approve' : 'Reject'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reconciliation;