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
  }
};
