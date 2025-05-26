"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Admin } from '@/types/staff';
import { deleteAdmin } from '@/lib/api/staffApi';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin;
  onSuccess: (message: string) => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  admin,
  onSuccess
}: DeleteConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      await deleteAdmin(admin.id);
      onSuccess('Admin deleted successfully!');
      onClose();
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Delete Staff
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <p>
            Are you sure you want to delete <span className="font-medium">{admin.first_name} {admin.last_name}</span>?
          </p>
          
          <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              This action cannot be undone. This will permanently delete the staff member account.
            </p>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 flex items-center p-2 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Staff"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}