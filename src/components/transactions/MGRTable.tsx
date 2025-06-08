import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MGRDetailsModal from './MGRDetailsModal';
import CreatorDetailsModal from './CreatorDetailsModal';

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

interface ApiResponse {
  status: string;
  message: {
    current_page: number;
    data: MGR[];
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

interface MGRTableProps {
  startDate: Date;
  endDate: Date;
}

const MGRTable: React.FC<MGRTableProps> = ({ startDate, endDate }) => {
  const [mgrData, setMgrData] = useState<MGR[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMgr, setSelectedMgr] = useState<MGR | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isCreatorModalVisible, setIsCreatorModalVisible] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 3,
    total: 0,
    from: 0,
    to: 0
  });

  useEffect(() => {
    const fetchMGRData = async () => {
      try {
        const token = localStorage.getItem('collo-admin-token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const formattedStartDate = format(startDate, 'MM/dd/yyyy');
        const formattedEndDate = format(endDate, 'MM/dd/yyyy');

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiBaseUrl) {
          throw new Error('API base URL not configured');
        }

        let url = `${apiBaseUrl}/admin/finance/mgr?start_date=${formattedStartDate}&end_date=${formattedEndDate}&perPage=3&page=${pagination.current_page}`;
        
        if (selectedStatus !== 'all') {
          url += `&status=${selectedStatus}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        setMgrData(result.message.data);
        setPagination({
          current_page: result.message.current_page,
          last_page: result.message.last_page,
          per_page: result.message.per_page,
          total: result.message.total,
          from: result.message.from,
          to: result.message.to
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMGRData();
  }, [startDate, endDate, selectedStatus, pagination.current_page]);

  const showModal = (mgr: MGR) => {
    setSelectedMgr(mgr);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCreatorModalCancel = () => {
    setIsCreatorModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'system_deactivated', label: 'System Deactivated' },
    { value: 'started', label: 'Started' }
  ];

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      setPagination(prev => ({ ...prev, current_page: page }));
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = pagination.last_page;

    if (pagination.last_page > maxVisiblePages) {
      const half = Math.floor(maxVisiblePages / 2);
      startPage = Math.max(pagination.current_page - half, 1);
      endPage = startPage + maxVisiblePages - 1;

      if (endPage > pagination.last_page) {
        endPage = pagination.last_page;
        startPage = endPage - maxVisiblePages + 1;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${pagination.current_page === i ? 'bg-[#470B96] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of{' '}
          <span className="font-medium">{pagination.total}</span> results
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={`px-3 py-1 rounded-md ${1 === pagination.current_page ? 'bg-[#470B96] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 py-1">...</span>}
            </>
          )}
          {pages}
          {endPage < pagination.last_page && (
            <>
              {endPage < pagination.last_page - 1 && <span className="px-2 py-1">...</span>}
              <button
                onClick={() => handlePageChange(pagination.last_page)}
                className={`px-3 py-1 rounded-md ${pagination.last_page === pagination.current_page ? 'bg-[#470B96] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {pagination.last_page}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Merry-Go-Round Lists</h2>
      <p className="text-sm text-gray-600 mb-4">
        Showing data from {format(startDate, 'MMM d, yyyy')} to {format(endDate, 'MMM d, yyyy')}
      </p>

      {/* Status Filter */}
      <div className="mb-4">
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <select
          id="status-filter"
          className="block w-60 p-3 border text-base border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPagination(prev => ({ ...prev, current_page: 1 }));
          }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* MGR Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mgrData.map((mgr) => (
              <tr key={mgr.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mgr.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{mgr.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mgr.number_of_members}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {mgr.currency} {mgr.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(mgr.status)} capitalize`}>
                    {mgr.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => showModal(mgr)}
                    className="text-[#470B96] hover:text-[#470B96]/85 cursor-pointer"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* MGR Details Modal */}
      <MGRDetailsModal
        visible={isModalVisible}
        onCancel={handleCancel}
        mgr={selectedMgr}
        onGetCreatorDetails={(creator) => {
          setCreator(creator);
          setIsCreatorModalVisible(true);
        }}
      />

      {/* Creator Details Modal */}
      <CreatorDetailsModal
        visible={isCreatorModalVisible}
        onCancel={handleCreatorModalCancel}
        creator={creator}
      />
    </div>
  );
};

export default MGRTable;