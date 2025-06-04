import React, { useState, useEffect } from 'react';
import { Modal, Table, Spin, Alert, Empty } from 'antd';
import { format } from 'date-fns';

interface Allotment {
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
  expected_amount: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    [key: string]: unknown; // for other user properties we might not use
  };
}

interface ApiResponse {
  message: string;
  data: {
    current_page: number;
    data: Allotment[];
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

interface AllotmentModalProps {
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

const AllotmentModal: React.FC<AllotmentModalProps> = ({ 
  open, 
  onClose, 
  mgrId, 
  mgrName 
}) => {
  const [allotments, setAllotments] = useState<Allotment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (open && mgrId) {
      fetchAllotments();
    } else {
      // Reset state when modal closes
      setAllotments([]);
      setError(null);
    }
  }, [open, mgrId, pagination.current]);

  const fetchAllotments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem('collo-admin-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Get date range from localStorage
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

      const url = `${apiBaseUrl}/admin/finance/mgr/allotments?start_date=${startDate}&end_date=${endDate}&mgrId=${mgrId}&page=${pagination.current}`;

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(url, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      });

      if (!response.ok) {
        if (response.status === 404) {
          setAllotments([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      setAllotments(result.data.data || []);
      setPagination({
        ...pagination,
        total: result.data.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setAllotments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: Pagination) => {
    setPagination(pagination);
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: Allotment['user']) => (
        <span>
          {user ? `${user.first_name} ${user.last_name}` : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'user',
      key: 'phone',
      render: (user: Allotment['user']) => (
        <span>{user?.phone_number || 'N/A'}</span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string, record: Allotment) => (
        <span>{record.currency} {parseFloat(amount).toLocaleString()}</span>
      ),
    },
    {
      title: 'Expected Amount',
      dataIndex: 'expected_amount',
      key: 'expected_amount',
      render: (expectedAmount: string, record: Allotment) => (
        <span>{record.currency} {parseFloat(expectedAmount).toLocaleString()}</span>
      ),
    },
    {
      title: 'Processed',
      dataIndex: 'processed',
      key: 'processed',
      render: (processed: number) => (
        <span className={processed ? 'text-green-600' : 'text-yellow-600'}>
          {processed ? 'Yes' : 'No'}
        </span>
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
      title: 'Expected Date',
      dataIndex: 'expected_date',
      key: 'expected_date',
      render: (date: string) => (
        <span>{date ? format(new Date(date), 'MMM d, yyyy') : 'N/A'}</span>
      ),
    },
    {
      title: 'Processed Date',
      dataIndex: 'processed_date',
      key: 'processed_date',
      render: (date: string) => (
        <span>{date ? format(new Date(date), 'MMM d, yyyy') : 'N/A'}</span>
      ),
    },
    {
      title: 'Allotment Date',
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
        title={`Allotments for ${mgrName}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={1200}
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
          {allotments.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                error 
                  ? "Could not load allotments" 
                  : "No allotments found for this MGR"
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={allotments}
              rowKey="id"
              pagination={{
                ...pagination,
                showSizeChanger: false,
              }}
              onChange={handleTableChange as never}
              scroll={{ x: true }}
              locale={{
                emptyText: 'No allotments found'
              }}
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default AllotmentModal;
