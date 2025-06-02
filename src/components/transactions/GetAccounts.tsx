import React, { useState } from 'react';
// import { format } from 'date-fns';
import BankAccounts from './BankAccounts';
import VirtualAccounts from './VirtualAccounts';

interface GetAccountsProps {
  startDate: Date;
  endDate: Date;
}

type AccountType = 'bank' | 'virtual';

const GetAccounts: React.FC<GetAccountsProps> = ({ startDate, endDate }) => {
  const [activeTab, setActiveTab] = useState<AccountType>('bank');

  return (
    <div className="container mx-auto ">  

      <div className="flex ">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'bank' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} cursor-pointer`}
          onClick={() => setActiveTab('bank')}
        >
          Bank Accounts
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'virtual' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'} cursor-pointer`}
          onClick={() => setActiveTab('virtual')}
        >
          Virtual Accounts
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'bank' ? (
          <BankAccounts startDate={startDate} endDate={endDate} />
        ) : (
          <VirtualAccounts startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  );
};

export default GetAccounts;