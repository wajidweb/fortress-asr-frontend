import { api } from './api';

export interface ContractRecord {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  startDate?: string | null;
  expiryDate?: string | null;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'ARCHIVED' | string;
  clientId?: string | null;
  guardId?: string | null;
  siteId?: string | null;
  serviceRequestId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    companyName: string;
  } | null;
  guard?: {
    id: string;
    firstName: string;
    lastName: string;
    siaLicenceNumber?: string | null;
  } | null;
  site?: {
    id: string;
    name: string;
  } | null;
}

export const contractService = {
  // Admin Operations
  uploadContract: (formData: FormData) => {
    return api.post<{ message: string; contract: ContractRecord }>('/admin/contracts', formData);
  },

  getAdminContracts: (params?: { clientId?: string; guardId?: string; siteId?: string; serviceRequestId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.clientId) query.append('clientId', params.clientId);
    if (params?.guardId) query.append('guardId', params.guardId);
    if (params?.siteId) query.append('siteId', params.siteId);
    if (params?.serviceRequestId) query.append('serviceRequestId', params.serviceRequestId);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ contracts: ContractRecord[] }>(`/admin/contracts${qs}`);
  },

  deleteContract: (id: string) => {
    return api.delete<{ message: string }>(`/admin/contracts/${id}`);
  },

  // Client Operations (Read-only)
  getClientContracts: () => {
    return api.get<{ contracts: ContractRecord[] }>('/client/contracts');
  },

  // Guard Operations (Read-only)
  getGuardContracts: () => {
    return api.get<{ contracts: ContractRecord[] }>('/guard/contracts');
  },
};
