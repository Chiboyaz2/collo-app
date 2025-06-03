import React, { useState } from 'react';
import { Modal } from 'antd';
import { format, parseISO } from 'date-fns';
import DefaultersModal, { DefaultersApiResponse } from './DefaultersModal';
import GetUserModal from "./GetUserModal";

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
      setIsDefaultersModalVisible(true); // Open modal immediately when fetching starts
      
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

  return (
    <>
      <Modal
        title="MGR Details"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
      >
        {mgr && (
          <div className="space-y-4">
            {creatorError && (
              <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">Error: {creatorError}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Name</h4>
                <p>{mgr.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Status</h4>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(mgr.status)} capitalize`}>
                  {mgr.status}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Duration</h4>
                <p className="capitalize">{mgr.duration}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Number of Members</h4>
                <p>{mgr.number_of_members}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Amount</h4>
                <p>{mgr.currency} {mgr.amount.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Allotment Type</h4>
                <p className="capitalize">{mgr.allotment_type}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Join Date Deadline</h4>
                <p>{format(parseISO(mgr.join_date_deadline), 'MMM d, yyyy h:mm a')}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Contribution Start Date</h4>
                <p>{format(parseISO(mgr.contribution_start_date), 'MMM d, yyyy h:mm a')}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Allocation Date</h4>
                <p>{format(parseISO(mgr.allocation_date), 'MMM d, yyyy h:mm a')}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Current Cycle</h4>
                <p>{mgr.current_cycle_number}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="text-gray-600">{mgr.desc}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Invite Link</h4>
              <a 
                href={mgr.invite_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {mgr.invite_link}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Created At</h4>
                <p>{format(parseISO(mgr.created_at), 'MMM d, yyyy h:mm a')}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Updated At</h4>
                <p>{format(parseISO(mgr.updated_at), 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
            <div className="pt-4 flex space-x-4">
              <button
                onClick={getCreatorDetails}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                disabled={creatorLoading}
              >
                {creatorLoading ? 'Loading...' : 'Get Creator Details'}
              </button>
              <button
                onClick={getDefaulters}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                disabled={defaultersLoading}
              >
                {defaultersLoading ? 'Loading...' : 'Get Defaulters'}
              </button>
              <button
                onClick={handleGetUserModalOpen}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
              >
                Get MGR Users
              </button>
            </div>
          </div>
        )}
      </Modal>
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
    </>
  );
};

export default MGRDetailsModal;