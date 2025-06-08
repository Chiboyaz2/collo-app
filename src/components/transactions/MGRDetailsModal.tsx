import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import DefaultersModal, { DefaultersApiResponse } from './DefaultersModal';
import GetUserModal from "./GetUserModal";
import ContributionsModal from './ContributionsModal';
import AllotmentModal from './AllotmentModal';

interface MGR {
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
}

interface Creator {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  dob: string | null;
  gender: string | null;
  marital_status: string | null;
  email: string;
  email_verified_at: string | null;
  phone_number: string;
  phone_verified_at: string | null;
  id_number: string | null;
  id_type: string | null;
  address: string | null;
  nearest_landmark: string | null;
  lga: string | null;
  state: string | null;
  nationality: string | null;
  home_town: string | null;
  occupation: string | null;
  employer: string | null;
  employer_address: string | null;
  nok_name: string | null;
  nok_phone_number: string | null;
  nok_email: string | null;
  nok_address: string | null;
  nok_relationship: string | null;
  referral_code: string | null;
  kyc_status: number;
  nin_verification_status: number;
  bvn_verification_status: number;
  created_at: string;
  updated_at: string;
  signup_referral_code: string | null;
  nin_data: string | null;
  deleted_at: string | null;
  user_role_id: number;
}

interface Defaulter {
  id: string;
  user_id: number;
  mgr_id: string;
  cycle_number: number;
  amount: number;
  status: string;
  created_at: string;
  in_grace_period: number;
  is_paid: number;
  mgr_cycle_id: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    email?: string;
  };
}

interface MGRDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  mgr: MGR | null;
  onGetCreatorDetails: (creator: Creator) => void;
}

const MGRDetailsModal: React.FC<MGRDetailsModalProps> = ({ 
  visible, 
  onCancel, 
  mgr, 
  onGetCreatorDetails 
}) => {
  const [creatorLoading, setCreatorLoading] = useState<boolean>(false);
  const [creatorError, setCreatorError] = useState<string | null>(null);
  const [defaultersLoading, setDefaultersLoading] = useState<boolean>(false);
  const [defaultersError, setDefaultersError] = useState<string | null>(null);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [isDefaultersModalVisible, setIsDefaultersModalVisible] = useState<boolean>(false);
  const [isGetUserModalOpen, setIsGetUserModalOpen] = useState<boolean>(false);
  const [isAllotmentModalOpen, setIsAllotmentModalOpen] = useState<boolean>(false);
  const [isContributionsModalOpen, setIsContributionsModalOpen] = useState<boolean>(false);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'system_deactivated':
        return 'bg-gray-100 text-gray-800';
      case 'started':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchCreatorDetails = async (creatorId: number): Promise<void> => {
    try {
      setCreatorLoading(true);
      setCreatorError(null);
      
      const token = localStorage.getItem('collo-admin-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('API base URL not configured');
      }

      const response = await fetch(`${apiBaseUrl}/admin/customer/${creatorId}`, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      onGetCreatorDetails(result.message);
    } catch (err) {
      setCreatorError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setCreatorLoading(false);
    }
  };

  const getCreatorDetails = (): void => {
    if (mgr) {
      fetchCreatorDetails(mgr.creator_id);
    }
  };

  const fetchDefaulters = async (mgrId: string): Promise<void> => {
    try {
      setDefaultersLoading(true);
      setDefaultersError(null);
      setIsDefaultersModalVisible(true);
      
      const token = localStorage.getItem('collo-admin-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('API base URL not configured');
      }

      const response = await fetch(`${apiBaseUrl}/admin/finance/mgr/default?perPage=10&mgrId=${mgrId}`, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DefaultersApiResponse = await response.json();
      setDefaulters(result.data?.data || []);
    } catch (err) {
      setDefaultersError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setDefaultersLoading(false);
    }
  };

  const getDefaulters = (): void => {
    if (mgr) {
      fetchDefaulters(mgr.id);
    }
  };

  const handleDefaultersModalCancel = (): void => {
    setIsDefaultersModalVisible(false);
  };

  const handleGetUserModalOpen = (): void => {
    setIsGetUserModalOpen(true);
  };

  const handleGetUserModalClose = (): void => {
    setIsGetUserModalOpen(false);
  };

  const handleAllotmentModalOpen = (): void => {
    setIsAllotmentModalOpen(true);
  };

  const handleAllotmentModalClose = (): void => {
    setIsAllotmentModalOpen(false);
  };

  const handleContributionsModalOpen = (): void => {
    setIsContributionsModalOpen(true);
  };

  const handleContributionsModalClose = (): void => {
    setIsContributionsModalOpen(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500/50 bg-opacity-75 transition-opacity" onClick={onCancel}></div>
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              <div className="flex-1 py-2 overflow-y-auto px-4 sm:px-6 ">
                <div className="flex items-start justify-between mt-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {mgr?.name || 'MGR Details'}
                  </h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      className="-m-2 p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
                      onClick={onCancel}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {mgr && (
                  <div className="flex flex-col space-y-6 mt-4">
                    {creatorError && (
                      <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md animate-fadeIn">
                        <p className="text-red-600 text-sm">Error: {creatorError}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(mgr.status)} capitalize transition-all duration-200`}>
                        {mgr.status}
                      </span>
                      <span className="text-sm text-gray-500">ID: {mgr.id.substring(0, 8)}...</span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <h3 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">Basic Information</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">Description</h4>
                          <p className="text-gray-800 text-sm mt-1">{mgr.desc}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500">Duration</h4>
                            <p className="text-gray-800 text-sm capitalize">{mgr.duration}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-500">Members</h4>
                            <p className="text-gray-800 text-sm">{mgr.number_of_members}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500">Amount</h4>
                            <p className="text-gray-800 text-sm font-medium">{mgr.currency} {mgr.amount.toLocaleString()}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-500">Allotment Type</h4>
                            <p className="text-gray-800 text-sm capitalize">{mgr.allotment_type}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <h3 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">Dates & Timeline</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">Join Deadline</h4>
                          <p className="text-gray-800 text-sm">{format(parseISO(mgr.join_date_deadline), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">Contribution Start</h4>
                          <p className="text-gray-800 text-sm">{format(parseISO(mgr.contribution_start_date), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">Allocation Date</h4>
                          <p className="text-gray-800 text-sm">{format(parseISO(mgr.allocation_date), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500">Current Cycle</h4>
                            <p className="text-gray-800 text-sm font-medium">{mgr.current_cycle_number}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-500">Created</h4>
                            <p className="text-gray-800 text-sm">{format(parseISO(mgr.created_at), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Invite Link</h4>
                      <a 
                        href={mgr.invite_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 text-sm truncate block hover:underline transition-colors duration-200"
                      >
                        {mgr.invite_link}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={getCreatorDetails}
                    className="bg-white hover:bg-blue-600 text-blue-500 hover:text-white border-blue-500 border rounded-lg
                     font-medium py-2 px-3  cursor-pointer text-sm transition-colors duration-200 flex justify-center items-center"
                    disabled={creatorLoading}
                  >
                    {creatorLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : 'Get Admins Details'}
                  </button>
                  
                  <button
                    onClick={getDefaulters}
                    className="bg-white hover:bg-blue-600 text-blue-500 hover:text-white border-blue-500 border rounded-lg
                     font-medium py-2 px-3  cursor-pointer text-sm transition-colors duration-200 flex justify-center items-center"
                    disabled={defaultersLoading}
                  >
                    {defaultersLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : 'Get Defaulters'}
                  </button>
                  
                  <button
                    onClick={handleGetUserModalOpen}
                    className="bg-white hover:bg-blue-600 text-blue-500 hover:text-white border-blue-500 border rounded-lg
                     font-medium py-2 px-3  cursor-pointer text-sm transition-colors duration-200 flex justify-center items-center"
                  >
                    Get MGR Members
                  </button>
                  
                  <button
                    onClick={handleContributionsModalOpen}
                    className="bg-white hover:bg-blue-600 text-blue-500 hover:text-white border-blue-500 border rounded-lg
                     font-medium py-2 px-3  cursor-pointer text-sm transition-colors duration-200 flex justify-center items-center"
                  >
                    Get Contributions
                  </button>
                  
                  <button
                    onClick={handleAllotmentModalOpen}
                    className="bg-white hover:bg-blue-600 text-blue-500 hover:text-white border-blue-500 border rounded-lg
                     font-medium py-2 px-3  cursor-pointer text-sm transition-colors duration-200 flex justify-center items-center"
                  >
                    Get Allotment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DefaultersModal
        visible={isDefaultersModalVisible}
        onCancel={handleDefaultersModalCancel}
        defaulters={defaulters}
        loading={defaultersLoading}
        error={defaultersError}
      />
      
      <GetUserModal
        open={isGetUserModalOpen}
        onClose={handleGetUserModalClose}
        mgrId={mgr?.id || ''}
        mgrName={mgr?.name || ''}
      />
      
      <ContributionsModal
        open={isContributionsModalOpen}
        onClose={handleContributionsModalClose}
        mgrId={mgr?.id || ''}
        mgrName={mgr?.name || ''}
      />
      
      <AllotmentModal
        open={isAllotmentModalOpen}
        onClose={handleAllotmentModalClose}
        mgrId={mgr?.id || ''}
        mgrName={mgr?.name || ''}
      />
    </>
  );
};

export default MGRDetailsModal;