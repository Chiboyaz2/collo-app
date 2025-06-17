import React, { useState, useEffect } from 'react';

interface MGRMetadata {
  totalMgrs: number;
  averageUsersPerMgr: number;
  totalContributions: string;
  totalAllotments: string;
}

interface ApiResponse {
  status: string;
  message: MGRMetadata;
  data: string;
}

const MGRdata = () => {
  const [metadata, setMetadata] = useState<MGRMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get base URL from environment variables
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    fetchMGRMetadata();
  }, []);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('collo-admin-token');
    }
    return null;
  };

  const fetchMGRMetadata = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${API_BASE_URL}/admin/finance/mgr/metadata`,
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
      
      if (result.status !== 'success') {
        throw new Error(result.data || 'Failed to fetch MGR metadata');
      }

      setMetadata(result.message);
    } catch (error) {
      console.error('Error fetching MGR metadata:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    return parseFloat(value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  return (
    <div className="p-4">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4  gap-6">
          {/* Total Managers Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total MGR</h3>
            <p className="text-xl font-bold text-blue-600">
              {metadata?.totalMgrs || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">Number of active managers</p>
          </div>

          {/* Average Users Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Average Users per MGR</h3>
            <p className="text-xl font-bold text-green-600">
              {(metadata?.averageUsersPerMgr || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Average user count per manager</p>
          </div>

          {/* Total Contributions Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Contributions</h3>
            <p className="text-xl font-bold text-purple-600">
              {metadata ? formatCurrency(metadata.totalContributions) : '$0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Sum of all contributions</p>
          </div>

          {/* Total Allotments Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Allotments</h3>
            <p className="text-xl font-bold text-orange-600">
              {metadata ? formatCurrency(metadata.totalAllotments) : '$0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Sum of all allotments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MGRdata;