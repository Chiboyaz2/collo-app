import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Spin, Alert, Empty } from 'antd';
import { format } from 'date-fns';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
}

interface Contribution {
  id: string;
  user_id: number;
  mgr_id: string;
  amount: string;
  mgr_cycle_id: string;
  created_at: string;
  updated_at: string;
  expected_date: string;
  processed: number;
  paused_check: number;
  processed_date: string;
  processed_by: string;
  currency: string;
  user?: User;
}

interface ApiResponse {
  message: string;
  data: {
    current_page: number;
    data: Contribution[];
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
}

interface ContributionsModalProps {
  open: boolean;
  onClose: () => void;
  mgrId: string;
  mgrName: string;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

const ContributionsModal: React.FC<ContributionsModalProps> = ({ 
  open, 
  onClose, 
  mgrId, 
  mgrName 
}) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('collo-admin-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const dateRange = localStorage.getItem('collo-calendar-date-range');
      let startDate = '01/01/2025';
      let endDate = format(new Date(), 'MM/dd/yyyy');

      if (dateRange) {
        try {
          const parsedDateRange = JSON.parse(dateRange);
          if (parsedDateRange.startDate && parsedDateRange.endDate) {
            startDate = format(new Date(parsedDateRange.startDate), 'MM/dd/yyyy');
            endDate = format(new Date(parsedDateRange.endDate), 'MM/dd/yyyy');
          }
        } catch (e) {
          console.error('Error parsing date range from localStorage', e);
        }
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('API base URL not configured');
      }

      const url = `${apiBaseUrl}/admin/finance/mgr/contributions?start_date=${startDate}&end_date=${endDate}&mgrId=${mgrId}&page=${pagination.current}`;

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(url, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      });

      if (!response.ok) {
        if (response.status === 404) {
          setContributions([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      setContributions(result.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: result.data.total,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setContributions([]);
    } finally {
      setLoading(false);
    }
  }, [mgrId, pagination.current]);

  useEffect(() => {
    if (open && mgrId) {
      fetchContributions();
    } else {
      setContributions([]);
      setError(null);
    }
  }, [open, mgrId, fetchContributions]);

  const handleTableChange = (newPagination: Pagination) => {
    setPagination(newPagination);
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: User | undefined) => (
        <div>
          <div className="font-medium">
            {user ? `${user.first_name} ${user.last_name}` : 'N/A'}
          </div>
          {user && (
            <div className="text-gray-500 text-sm">{user.phone_number}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string, record: Contribution) => (
        <span>{record.currency} {parseFloat(amount).toLocaleString()}</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: void, record: Contribution) => (
        <div className="space-y-1">
          <div>
            {record.processed ? (
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Processed
              </span>
            ) : (
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Pending
              </span>
            )}
          </div>
          <div>
            {record.paused_check ? (
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                Paused
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      title: 'Processed By',
      dataIndex: 'processed_by',
      key: 'processed_by',
      render: (processedBy: string) => (
        <span className="capitalize">{processedBy || 'N/A'}</span>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_: void, record: Contribution) => (
        <div className="space-y-1">
          <div>
            <span className="text-gray-500">Expected: </span>
            {record.expected_date ? format(new Date(record.expected_date), 'MMM d, yyyy') : 'N/A'}
          </div>
          <div>
            <span className="text-gray-500">Processed: </span>
            {record.processed_date ? format(new Date(record.processed_date), 'MMM d, yyyy') : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Contribution Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <span>{format(new Date(date), 'MMM d, yyyy h:mm a')}</span>
      ),
    },
  ];

  return (
    <div className=" z-[2000] flex items-center justify-center p-4">
      <Modal
        title={`Contributions for ${mgrName}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={1200}
        destroyOnHidden
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Spin spinning={loading}>
          {contributions.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                error 
                  ? "Could not load contributions" 
                  : "No contributions found for this MGR"
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={contributions}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: false,
              }}
              onChange={handleTableChange as never}
              scroll={{ x: true }}
              locale={{
                emptyText: 'No contributions found'
              }}
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default ContributionsModal;
