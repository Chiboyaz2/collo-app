export interface AdminRole {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Admin {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_role_id: number;
    admin_role_id: number;
    email_verified_at: string | null;
    is_suspended: number;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }
  
  export interface PaginatedAdmins {
    current_page: number;
    data: Admin[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  }
  
  export interface PaginationState {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
  }
  
  export interface AdminRolesResponse {
    status: string;
    message: AdminRole[] | string;
    data?: string;
  }
  
  export interface AdminsResponse {
    status: string;
    message: {
      count: number;
      total_admins: number;
      admins: PaginatedAdmins;
    };
    data?: string;
  }
  
  export interface CreateStaffData {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    admin_role: number;
    user_role: 1;
  }
  
  export interface UpdateStaffData {
    first_name: string;
    last_name: string;
    phone_number: string;
  }
  
  export interface ChangeRoleData {
    user_role: 1;
    admin_role: number;
  }