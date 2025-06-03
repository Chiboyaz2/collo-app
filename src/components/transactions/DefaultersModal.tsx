import React from 'react';
import { Modal } from 'antd';
import { format, parseISO } from 'date-fns';

interface Defaulter {
    id: string;
    user_id: number;
    mgr_id: string;
    in_grace_period: number;
    is_paid: number;
    mgr_cycle_id: string;
    cycle_number: number;
    amount: number;
    status: string;
    created_at: string;
    updated_at: string;
    user?: {
      first_name: string;
      last_name: string;
      phone_number: string;
      email?: string;
    };
  }
  

export interface DefaultersApiResponse {
  message: string;
  data: {
    current_page: number;
    data: Defaulter[];
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
}

interface DefaultersModalProps {
  visible: boolean;
  onCancel: () => void;
  defaulters: Defaulter[];
  loading: boolean;
  error: string | null;
}

const DefaultersModal: React.FC<DefaultersModalProps> = ({ 
  visible, 
  onCancel, 
  defaulters, 
  loading, 
  error 
}) => {
  return (
    <Modal
      title="MGR Defaulters"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {loading ? (
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
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-gray-600">No defaulters for this MGR plan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {defaulters.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-600">No defaulters for this MGR plan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grace Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {defaulters.map((defaulter) => (
                    <tr key={defaulter.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{defaulter.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{defaulter.mgr_cycle_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defaulter.in_grace_period === 1 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            In Grace Period
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Grace Period Expired
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defaulter.is_paid === 1 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Not Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(defaulter.created_at), 'MMM d, yyyy h:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default DefaultersModal;
