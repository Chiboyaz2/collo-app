import React from 'react';
import { format } from 'date-fns';
import { TransactionModalProps } from './transactionTypes';

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">Transaction Details</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 pb-2 border-b border-gray-100">Basic Information</h4>
              <DetailRow label="ID" value={transaction.id} />
              <DetailRow label="User ID" value={transaction.user_id} />
              <DetailRow label="Type" value={transaction.type} />
              <DetailRow 
                label="Status" 
                value={
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    transaction.provider_status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.provider_status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.provider_status}
                  </span>
                } 
              />
              <DetailRow label="Created" value={format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')} />
            </div>

            {/* Financial Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 pb-2 border-b border-gray-100">Financial Details</h4>
              <DetailRow label="Amount" value={`${transaction.amount} ${transaction.currency}`} />
              <DetailRow label="Fee" value={transaction.processing_fee} />
              <DetailRow label="Total" value={transaction.total_amount} />
              <DetailRow label="Balance Before" value={transaction.balance_before} />
              <DetailRow label="Balance After" value={transaction.balance_after} />
            </div>
          </div>

          {/* Transaction Flow */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 pb-2 border-b border-gray-100">Transaction Flow</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Flow" value={transaction.flow} />
              <DetailRow label="Source" value={`${transaction.source} (${transaction.source_id})`} />
              <DetailRow label="Destination" value={`${transaction.destination} (${transaction.destination_id})`} />
              <DetailRow label="Provider" value={transaction.provider} />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 pb-2 border-b border-gray-100">Additional Information</h4>
            <DetailRow label="Reference" value={transaction.reference} />
            <DetailRow label="Remark" value={transaction.remark || 'N/A'} />
            <DetailRow label="Description" value={transaction.description || 'N/A'} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for consistent detail rows
const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-sm font-medium text-gray-500">{label}:</span>
    <span className="text-sm text-gray-800 text-right max-w-[60%] overflow-hidden overflow-ellipsis">
      {value}
    </span>
  </div>
);

export default TransactionModal;