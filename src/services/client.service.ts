import { api } from './api';

export type ServiceRequestType = 'NEW_SITE_DEPLOYMENT' | 'EXTRA_GUARD_COVERAGE' | 'SCHEDULE_CHANGE' | 'SPECIAL_EVENT';
export type ServiceRequestStatus = 'PENDING_REVIEW' | 'UNDER_ASSESSMENT' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ServiceRequestUrgency = 'STANDARD' | 'PRIORITY' | 'EMERGENCY';

export interface SiteServiceRequest {
  id: string;
  clientId: string;
  siteId?: string | null;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  urgency: ServiceRequestUrgency;
  propertyName: string;
  propertyAddress: string;
  city?: string | null;
  postcode?: string | null;
  suggestedLatitude?: number | string | null;
  suggestedLongitude?: number | string | null;
  requiredGuardsCount: number;
  serviceStartDate: string;
  serviceEndDate?: string | null;
  shiftScheduleNotes?: string | null;
  specialInstructions?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  adminFeedbackNotes?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  site?: {
    id: string;
    name: string;
    address: string;
    latitude?: number | string;
    longitude?: number | string;
    geofenceRadiusMeters?: number;
  } | null;
}

export interface ClientSite {
  id: string;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  geofenceRadiusMeters: number;
  siteInstructions?: string | null;
  emergencyContact?: string | null;
  activeOfficersCount: number;
  activeShifts: Array<{
    id: string;
    checkInTime?: string | null;
    guard: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string | null;
    };
  }>;
  totalPatrolRoutes: number;
  totalIncidents: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteServiceRequestPayload {
  type?: ServiceRequestType;
  urgency?: ServiceRequestUrgency;
  propertyName: string;
  propertyAddress: string;
  city?: string;
  postcode?: string;
  suggestedLatitude?: number | null;
  suggestedLongitude?: number | null;
  requiredGuardsCount: number;
  serviceStartDate: string;
  serviceEndDate?: string | null;
  shiftScheduleNotes?: string;
  specialInstructions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  siteId?: string | null;
}

export type UpdateSiteServiceRequestPayload = Partial<CreateSiteServiceRequestPayload>;

export const clientService = {
  // Service requests
  getRequests: (params?: {
    status?: string;
    type?: string;
    urgency?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.type && params.type !== 'ALL') query.append('type', params.type);
    if (params?.urgency && params.urgency !== 'ALL') query.append('urgency', params.urgency);
    if (params?.search && params.search.trim() !== '') query.append('search', params.search.trim());
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{
      requests: SiteServiceRequest[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
      stats?: {
        total: number;
        pendingReview: number;
        underAssessment: number;
        approved: number;
      };
    }>(`/client/requests${qs}`);
  },

  getRequestById: (id: string) => {
    return api.get<{ request: SiteServiceRequest }>(`/client/requests/${id}`);
  },

  createRequest: (payload: CreateSiteServiceRequestPayload) => {
    return api.post<{ message: string; request: SiteServiceRequest }>(`/client/requests`, payload);
  },

  updateRequest: (id: string, payload: UpdateSiteServiceRequestPayload) => {
    return api.put<{ message: string; request: SiteServiceRequest }>(`/client/requests/${id}`, payload);
  },

  cancelRequest: (id: string) => {
    return api.delete<{ message: string; request: SiteServiceRequest }>(`/client/requests/${id}`);
  },

  // Monitored sites
  getSites: () => {
    return api.get<{ sites: ClientSite[] }>(`/client/sites`);
  },

  getSiteById: (id: string) => {
    return api.get<{ site: ClientSite }>(`/client/sites/${id}`);
  },
};
