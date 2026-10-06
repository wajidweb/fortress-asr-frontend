import { api } from './api';

export interface GuardProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  siaLicenceNumber: string | null;
  siaExpiryDate: string | null;
  rtwDocumentType: string | null;
  rtwDocumentUrl: string | null;
  rightToWorkExpiryDate: string | null;
  hasIndefiniteRTW: boolean;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  payRatePerHour: string;
  phoneNumber: string | null;
  profilePictureUrl?: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
}

export interface ClientManagementProfile {
  id: string;
  userId: string;
  companyName: string;
  urlSlug: string;
  billingAddress: string;
  logoUrl: string | null;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  billingRateHour: string;
  contactPerson: string | null;
  contactPhone: string | null;
  sites: Array<{ id: string; name: string; address?: string }>;
  sitesCount: number;
  createdAt: string;
  updatedAt: string;
  isProfileComplete: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
  };
}

export const adminService = {
  // Fetch all guards with optional status filtering (e.g. 'PENDING_APPROVAL')
  getGuards: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return api.get<{ guards: GuardProfile[] }>(`/admin/guards${query}`);
  },
  
  // Approve a Guard profile and update their status to ACTIVE
  approveGuard: (id: string) => {
    return api.put<{ message: string; guard: GuardProfile }>(`/admin/guards/${id}/approve`, {});
  },
  
  // Reject/Suspend a Guard profile and update their status to SUSPENDED
  rejectGuard: (id: string) => {
    return api.put<{ message: string; guard: GuardProfile }>(`/admin/guards/${id}/reject`, {});
  },

  // Fetch all clients with optional status filtering (e.g. 'PENDING_APPROVAL')
  getClients: (status?: string) => {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return api.get<{ clients: ClientManagementProfile[] }>(`/admin/clients${query}`);
  },

  // Approve a Client profile and update their status to ACTIVE
  approveClient: (id: string) => {
    return api.put<{ message: string; client: ClientManagementProfile }>(`/admin/clients/${id}/approve`, {});
  },

  // Reject/Suspend a Client profile and update their status to SUSPENDED
  rejectClient: (id: string) => {
    return api.put<{ message: string; client: ClientManagementProfile }>(`/admin/clients/${id}/reject`, {});
  }
};
