"use client"
import { useState, useEffect } from 'react';
import { format, subMonths, parse } from 'date-fns';
import TransactionsGraph from '@/components/transactions/TransactionsGraph';
import UserMetadata from '@/components/user-management/UserMetadata';
import ExportData from '@/components/ExportData';

type DefinedRange = {
  startDate: Date;
  endDate: Date;
  key: string;
};

const STORAGE_KEY = 'collo-calendar-date-range';

// Helper function to parse date from MM/dd/yyyy format
const parseDateFromLocalStorage = (dateString: string): Date => {
  return parse(dateString, 'MM/dd/yyyy', new Date());
};

// Helper function to format date to MM/dd/yyyy string
const formatDateForLocalStorage = (date: Date): string => {
  return format(date, 'MM/dd/yyyy');
};

export default function OverviewPage() {
  const today = new Date();
  const oneMonthAgo = subMonths(today, 1);

  // Initialize state with default values
  const [state, setState] = useState<DefinedRange>({
    startDate: oneMonthAgo,
    endDate: today,
    key: 'selection'
  });

  // Load saved date range from localStorage on component mount
  useEffect(() => {
    const savedRange = localStorage.getItem(STORAGE_KEY);
    if (savedRange) {
      try {
        const parsedRange = JSON.parse(savedRange);
        const loadedStartDate = parseDateFromLocalStorage(parsedRange.startDate);
        const loadedEndDate = parseDateFromLocalStorage(parsedRange.endDate);
        
        setState({
          startDate: loadedStartDate,
          endDate: loadedEndDate,
          key: 'selection'
        });

        // Save the loaded dates back to localStorage to ensure consistent format
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          startDate: formatDateForLocalStorage(loadedStartDate),
          endDate: formatDateForLocalStorage(loadedEndDate)
        }));

      } catch (error) {
        console.error('Failed to parse saved date range', error);
        // If parsing fails, save the default dates to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          startDate: formatDateForLocalStorage(oneMonthAgo),
          endDate: formatDateForLocalStorage(today)
        }));
      }
    } else {
      // If no saved range exists, save the default dates
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        startDate: formatDateForLocalStorage(oneMonthAgo),
        endDate: formatDateForLocalStorage(today)
      }));
    }
  }, []);

  const handleDateChange = (field: 'startDate' | 'endDate', value: Date) => {
    const newRange = {
      ...state,
      [field]: value
    };
    setState(newRange);
    
    // Save to localStorage whenever dates change
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      startDate: formatDateForLocalStorage(newRange.startDate),
      endDate: formatDateForLocalStorage(newRange.endDate)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className='relative '>
        <ExportData />
      </div>

      <UserMetadata />
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
          <p>Selected: {format(state.startDate, 'MM/dd/yyyy')} - {format(state.endDate, 'MM/dd/yyyy')}</p>
        </div>
      </div>

      {/* Transactions Graph Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <TransactionsGraph startDate={state.startDate} endDate={state.endDate} />
      </div>
    </div>
  );
}