/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { format, parse, eachMonthOfInterval, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyTransaction {
  date: string;
  total_inflow: string;
  total_outflow: string;
  net_flow: string;
  total_flow: string;
}

interface GraphData {
  transactions: DailyTransaction[];
}

interface ApiResponse {
  status: string;
  message: GraphData;
  data: string;
}

interface GraphProps {
  startDate: Date;
  endDate: Date;
}

const GraphDaily: React.FC<GraphProps> = ({ startDate, endDate }) => {
  const [graphData, setGraphData] = useState<DailyTransaction[]>([]);
  const [filteredData, setFilteredData] = useState<DailyTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startDate);
  const [availableMonths, setAvailableMonths] = useState<Date[]>([]);

  useEffect(() => {
    const fetchDailyGraphData = async () => {
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

        const response = await fetch(
          `${apiBaseUrl}/admin/finance/transaction/daily-graph?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
          {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        const transactions = result.message.transactions;
        setGraphData(transactions);

        // Extract unique months from the data
        if (transactions.length > 0) {
          const dates = transactions.map(t => parse(t.date, 'yyyy-MM-dd', new Date()));
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          const months = eachMonthOfInterval({ start: minDate, end: maxDate });
          setAvailableMonths(months);
          setCurrentMonth(months[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyGraphData();
  }, [startDate, endDate]);

  useEffect(() => {
    if (graphData.length > 0 && currentMonth) {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const filtered = graphData.filter(item => {
        const date = parse(item.date, 'yyyy-MM-dd', new Date());
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });
      
      setFilteredData(filtered);
    }
  }, [graphData, currentMonth]);

  // Prepare chart data
  const chartData = {
    labels: filteredData.map(item => format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMM d')),
    datasets: [
      {
        label: 'Inflow',
        data: filteredData.map(item => parseFloat(item.total_inflow)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Outflow',
        data: filteredData.map(item => parseFloat(item.total_outflow)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Net Flow',
        data: filteredData.map(item => parseFloat(item.net_flow)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Cash Flow',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-64 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full">
      <p className="text-gray-500 text-sm mb-4">
        Showing data from {format(startDate, 'MMM d, yyyy')} to {format(endDate, 'MMM d, yyyy')}
      </p>
      
      {/* Month Pagination */}
      {availableMonths.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const currentIndex = availableMonths.findIndex(m => 
                m.getMonth() === currentMonth.getMonth() && 
                m.getFullYear() === currentMonth.getFullYear()
              );
              if (currentIndex > 0) {
                setCurrentMonth(availableMonths[currentIndex - 1]);
              }
            }}
            disabled={availableMonths.findIndex(m => 
              m.getMonth() === currentMonth.getMonth() && 
              m.getFullYear() === currentMonth.getFullYear()
            ) === 0}
            className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          
          <span className="font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          
          <button
            onClick={() => {
              const currentIndex = availableMonths.findIndex(m => 
                m.getMonth() === currentMonth.getMonth() && 
                m.getFullYear() === currentMonth.getFullYear()
              );
              if (currentIndex < availableMonths.length - 1) {
                setCurrentMonth(availableMonths[currentIndex + 1]);
              }
            }}
            disabled={availableMonths.findIndex(m => 
              m.getMonth() === currentMonth.getMonth() && 
              m.getFullYear() === currentMonth.getFullYear()
            ) === availableMonths.length - 1}
            className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
      
      {filteredData.length > 0 ? (
        <div className="w-full h-96">
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available for {format(currentMonth, 'MMMM yyyy')}
        </div>
      )}
      
      {/* Summary Table */}
      {filteredData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inflow</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outflow</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Flow</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Flow</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  ₦ {parseFloat(item.total_inflow).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  ₦ {parseFloat(item.total_outflow).toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    parseFloat(item.net_flow) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₦ {parseFloat(item.net_flow).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦ {parseFloat(item.total_flow).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GraphDaily;