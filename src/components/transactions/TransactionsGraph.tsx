import React, { useState } from 'react';
import GraphDaily from './GraphDaily';
import GraphMonthly from './GraphMonthly';

interface TransactionsGraphProps {
  startDate: Date;
  endDate: Date;
}

const TransactionsGraph: React.FC<TransactionsGraphProps> = ({ startDate, endDate }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly');

  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('daily')}
            className={`py-2 px-4 font-medium ${
              viewMode === 'daily' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 cursor-pointer'
            }`}
          >
            Daily Datas
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`py-2 px-4 font-medium ${
              viewMode === 'monthly' 
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700 cursor-pointer'
            }`}
          >
            Monthly Datas
          </button>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <GraphDaily startDate={startDate} endDate={endDate} />
      ) : (
        <GraphMonthly startDate={startDate} endDate={endDate} />
      )}
    </div>
  );
};

export default TransactionsGraph;