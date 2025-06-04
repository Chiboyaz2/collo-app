"use client";
import { useState } from "react";
import UserMetadata from "../../../components/user-management/UserMetadata";
import UserTable from "../../../components/user-management/UserTable";

export default function UserManagementPage() {
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 5,
  });

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="p-6">
  
      <UserMetadata />
      
      <UserTable 
        currentPage={pagination.currentPage}
        perPage={pagination.perPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}