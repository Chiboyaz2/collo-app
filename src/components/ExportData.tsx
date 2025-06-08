import React, { useState } from 'react';

type ExportType = 
    'mgrs' | 
    'transactions' | 
    'virtual_accounts' | 
    'bank_accounts' | 
    'contributions' | 
    'allotments' | 
    'users_mgrs' | 
    'users';

const ExportData = () => {
    const [selectedType, setSelectedType] = useState<ExportType>('mgrs');
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            // Get token from local storage
            const token = localStorage.getItem('collo-admin-token');
            if (!token) {
                console.error('No token found in local storage');
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            const requestOptions: RequestInit = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow" as RequestRedirect
            };

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const url = `${baseUrl}/admin/finance/export-data?type=${selectedType}`;

            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the CSV text from the response
            const csvData = await response.text();
            
            // Create a Blob from the CSV data
            const blob = new Blob([csvData], { type: 'text/csv' });
            
            // Create a download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            
            // Set the file name with current date
            const fileName = `export-${selectedType}-${new Date().toISOString().slice(0, 10)}.csv`;
            link.setAttribute('download', fileName);
            
            // Append to DOM, trigger click, then remove
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            
            // Revoke the object URL to free up memory
            window.URL.revokeObjectURL(downloadUrl);
            
        } catch (error) {
            console.error('Error downloading data:', error);
            // You might want to add user feedback here, like a toast notification
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Export Data</h1>

            <div className='flex items-center gap-6'>
                <div className="mb-4">
                    <label htmlFor="exportType" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Export Type
                    </label>
                    <select
                        id="exportType"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as ExportType)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-60"
                    >
                        <option value="mgrs">MGR</option>
                        <option value="transactions">Transactions</option>
                        <option value="virtual_accounts">Virtual Accounts</option>
                        <option value="bank_accounts">Bank Accounts</option>
                        <option value="contributions">Contributions</option>
                        <option value="allotments">Allotments</option>
                        <option value="users_mgrs">Users MGRS</option>
                        <option value="users">Users</option>
                    </select>
                </div>
                
                <button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md text-white cursor-pointer ${isLoading ? 'bg-gray-400' : 
                        'bg-[#470B96] hover:bg-[#470B96]/85'}`}
                >
                    {isLoading ? 'Downloading...' : 'Download Export'}
                </button>
            </div>
        </div>
    );
};

export default ExportData;