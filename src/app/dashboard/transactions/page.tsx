"use client"
import { useState } from 'react';
import { format, subMonths } from 'date-fns';
import GetTransactions from '../../../components/transactions/GetTransactions';
import GetAccounts from '../../../components/transactions/GetAccounts';
import GetMGR from '../../../components/transactions/GetMGR';
import TransactionsGraph from '@/components/transactions/TransactionsGraph';

type DefinedRange = {
  startDate: Date;
  endDate: Date;
  key: string;
};

type TabType = 'transactions' | 'account' | 'mgr';

export default function Transactions() {
  const today = new Date();
  const oneMonthAgo = subMonths(today, 1);

  const [state, setState] = useState<DefinedRange>({
    startDate: oneMonthAgo,
    endDate: today,
    key: 'selection'
  });

  const [activeTab, setActiveTab] = useState<TabType>('transactions');

  const handleDateChange = (field: 'startDate' | 'endDate', value: Date) => {
    const newRange = {
      ...state,
      [field]: value
    };
    setState(newRange);
    
    console.log('Start Date:', format(newRange.startDate, 'MM/dd/yyyy'));
    console.log('End Date:', format(newRange.endDate, 'MM/dd/yyyy'));
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'account':
        return <GetAccounts startDate={state.startDate} endDate={state.endDate} />;
      case 'mgr':
        return <GetMGR startDate={state.startDate} endDate={state.endDate} />;
      case 'transactions':
      default:
        return (
            <div>
                <TransactionsGraph startDate={state.startDate} endDate={state.endDate}/>
                <GetTransactions startDate={state.startDate} endDate={state.endDate} />
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
        <p className="text-gray-600 mt-2">
          View and analyze your transaction history by selecting a date range below.
        </p>
      </header>

      {/* Date Range Inputs */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={format(state.startDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange('startDate', new Date(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={format(state.endDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange('endDate', new Date(e.target.value))}
              min={format(state.startDate, 'yyyy-MM-dd')}
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>Selected: {format(state.startDate, 'MMM d, yyyy')} - {format(state.endDate, 'MMM d, yyyy')}</p>
        </div>
      </div>

      {/* Transactions Section - Full width */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'transactions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'account' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'mgr' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
            onClick={() => setActiveTab('mgr')}
          >
            MGR
          </button>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {activeTab === 'transactions' && ''}
          {activeTab === 'account' && ''}
          {activeTab === 'mgr' && ''}
        </h2>
        
        {renderActiveTab()}
      </div>
    </div>
  );
}