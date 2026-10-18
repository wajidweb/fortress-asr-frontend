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
  visitAssigneeId?: string | null;
  visitScheduledAt?: string | null;
  visitStatus?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | null;
  visitAssignee?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  surveyLatitude?: number | string | null;
  surveyLongitude?: number | string | null;
  surveyGeofenceRadiusMeters?: number | null;
  surveyContactName?: string | null;
  surveyContactPhone?: string | null;
  surveyNotes?: string | null;
  surveyConductedAt?: string | null;
  // Commercial Pricing & Rates
  pricingStatus?: 'DRAFT' | 'PROPOSED' | 'AGREED' | 'SUPERSEDED' | null;
  chargeRatePerHour?: number | string | null;
  expectedShiftDurationHours?: number | string | null;
  expectedWeeklyHours?: number | string | null;
  expectedMonthlyHours?: number | string | null;
  nightRatePerHour?: number | string | null;
  weekendRatePerHour?: number | string | null;
  overtimeRatePerHour?: number | string | null;
  vatTreatment?: string | null;
  pricingNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  site?: {
    id: string;
    name: string;
    address: string;
    latitude?: number | string;
    longitude?: number | string;
    geofenceRadiusMeters?: number;
    billingRateHour?: number | string | null;
    vatTreatment?: string | null;
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
  billingRateHour?: number | string | null;
  vatTreatment?: string | null;
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
  totalShifts?: number;
  totalPatrolRoutes: number;
  totalIncidents: number;
  createdAt: string;
  updatedAt: string;
  serviceRequest?: {
    id: string;
    type: ServiceRequestType;
    status: ServiceRequestStatus;
    urgency: ServiceRequestUrgency;
    requiredGuardsCount: number;
    serviceStartDate: string;
    serviceEndDate?: string | null;
    shiftScheduleNotes?: string | null;
    specialInstructions?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    adminFeedbackNotes?: string | null;
    surveyLatitude?: number | string | null;
    surveyLongitude?: number | string | null;
    surveyGeofenceRadiusMeters?: number | null;
    surveyContactName?: string | null;
    surveyContactPhone?: string | null;
    surveyNotes?: string | null;
    surveyConductedAt?: string | null;
    pricingStatus?: 'DRAFT' | 'PROPOSED' | 'AGREED' | 'SUPERSEDED' | null;
    chargeRatePerHour?: number | string | null;
    expectedWeeklyHours?: number | string | null;
    vatTreatment?: string | null;
    pricingNotes?: string | null;
    visitAssignee?: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  } | null;
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

  // Corporate Client Property Deployment Shifts & Rota
  getShifts: (params?: { siteId?: string; startDate?: string; endDate?: string; status?: string; upcoming?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.siteId) query.append('siteId', params.siteId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.upcoming) query.append('upcoming', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ shifts: ClientShift[] }>(`/client/shifts${qs}`);
  },

  // Corporate Client Billing & Service Attendance Report
  getBillingReport: (params?: { startDate?: string; endDate?: string; siteId?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.siteId) query.append('siteId', params.siteId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<ClientBillingReportData>(`/client/reports/billing${qs}`);
  },
};

export interface ClientBillingReportData {
  currency: string;
  currencySymbol: string;
  summary: {
    totalDeliveredHours: number;
    totalDeliveredChargesNet: number;
    totalDeliveredChargesVat: number;
    totalDeliveredChargesGross: number;
    totalScheduledUpcomingHours: number;
    totalProjectedUpcomingChargesNet: number;
    totalDeliveredShifts: number;
    totalInProgressShifts: number;
    totalUpcomingShifts: number;
    totalMissedShifts: number;
    averageHourlyBillingRate: number;
    notice: string;
  };
  bySite: Array<{
    siteId: string;
    siteName: string;
    siteAddress: string;
    vatTreatment: string;
    clientRate: number;
    shiftCount: number;
    deliveredHours: number;
    deliveredNet: number;
    deliveredVat: number;
    deliveredGross: number;
  }>;
  shiftDeliveryLogs: Array<{
    shiftId: string;
    siteId: string;
    siteName: string;
    siteAddress: string;
    officerName: string;
    siaBadge: string;
    startTime: string;
    endTime: string;
    status: string;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    scheduledDurationHours: number;
    deliveredHours: number;
    clientRateHour: number;
    netCharge: number;
    vatAmount: number;
    grossCharge: number;
    vatTreatment: string;
    isCompleted: boolean;
    isInProgress: boolean;
    isUpcoming: boolean;
    isMissed: boolean;
    isGpsVerified: boolean;
  }>;
}

export interface ClientShift {
  id: string;
  siteId: string;
  guardId: string;
  startTime: string;
  endTime: string;
  status: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  clientBillingRateHour: number;
  scheduledDurationHours: number;
  actualDeliveredHours?: number | null;
  netCharge: number;
  vatAmount: number;
  grossCharge: number;
  site?: {
    id: string;
    name: string;
    address: string;
    billingRateHour: number;
    vatTreatment?: string | null;
    geofenceRadiusMeters: number;
  };
  guard?: {
    id: string;
    firstName: string;
    lastName: string;
    siaLicenceNumber?: string | null;
    profilePictureUrl?: string | null;
  };
}
