"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { AdminRole, Admin } from '@/types/staff';
import { changeAdminRole } from '@/lib/api/staffApi';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin;
  adminRoles: AdminRole[];
  onSuccess: (message: string) => void;
}

export function ChangeRoleModal({
  isOpen,
  onClose,
  admin,
  adminRoles,
  onSuccess
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(admin.admin_role_id.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await changeAdminRole(admin.id, {
        user_role: 1,
        admin_role: Number(selectedRole)
      });
      
      onSuccess('Role changed successfully!');
      onClose();
    } catch (error) {
      console.error('Error changing role:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border shadow-lg z-50">
        <DialogHeader>
          <DialogTitle>Change Staff Role</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <p className="mb-2">
              Change role for <span className="font-medium">{admin.first_name} {admin.last_name}</span>
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminRole">Admin Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                {adminRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 flex items-center p-2 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || selectedRole === admin.admin_role_id.toString()}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}