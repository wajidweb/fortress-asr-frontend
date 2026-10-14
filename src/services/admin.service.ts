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
  // Fetch guards with optional status filtering, search & pagination
  getGuards: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    export?: boolean;
  } | string) => {
    const query = new URLSearchParams();
    if (typeof params === 'string') {
      if (params && params !== 'ALL') query.append('status', params);
    } else if (params) {
      if (params.status && params.status !== 'ALL') query.append('status', params.status);
      if (params.search && params.search.trim() !== '') query.append('search', params.search.trim());
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.export) query.append('export', 'true');
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ 
      guards: GuardProfile[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
      stats?: {
        total: number;
        pendingApproval: number;
        active: number;
        suspended: number;
      };
    }>(`/admin/guards${qs}`);
  },
  
  // Approve a Guard profile and update their status to ACTIVE
  approveGuard: (id: string) => {
    return api.put<{ message: string; guard: GuardProfile }>(`/admin/guards/${id}/approve`, {});
  },
  
  // Reject/Suspend a Guard profile and update their status to SUSPENDED
  rejectGuard: (id: string) => {
    return api.put<{ message: string; guard: GuardProfile }>(`/admin/guards/${id}/reject`, {});
  },

  // Fetch clients with optional status filtering, search & pagination
  getClients: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    export?: boolean;
  } | string) => {
    const query = new URLSearchParams();
    if (typeof params === 'string') {
      if (params && params !== 'ALL') query.append('status', params);
    } else if (params) {
      if (params.status && params.status !== 'ALL') query.append('status', params.status);
      if (params.search && params.search.trim() !== '') query.append('search', params.search.trim());
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.export) query.append('export', 'true');
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ 
      clients: ClientManagementProfile[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
      stats?: {
        total: number;
        pendingApproval: number;
        active: number;
        suspended: number;
      };
    }>(`/admin/clients${qs}`);
  },

  // Approve a Client profile and update their status to ACTIVE
  approveClient: (id: string) => {
    return api.put<{ message: string; client: ClientManagementProfile }>(`/admin/clients/${id}/approve`, {});
  },

  // Reject/Suspend a Client profile and update their status to SUSPENDED
  rejectClient: (id: string) => {
    return api.put<{ message: string; client: ClientManagementProfile }>(`/admin/clients/${id}/reject`, {});
  },

  // Fetch all site service requests with optional filters & pagination
  getSiteServiceRequests: (params?: {
    status?: string;
    urgency?: string;
    clientId?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
    export?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.urgency && params.urgency !== 'ALL') query.append('urgency', params.urgency);
    if (params?.clientId) query.append('clientId', params.clientId);
    if (params?.type && params.type !== 'ALL') query.append('type', params.type);
    if (params?.search && params.search.trim() !== '') query.append('search', params.search.trim());
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.export) query.append('export', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{
      requests: AdminSiteServiceRequest[];
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
    }>(`/admin/requests${qs}`);
  },

  // Fetch single site service request by ID
  getSiteServiceRequestById: (id: string) => {
    return api.get<{ request: AdminSiteServiceRequest }>(`/admin/requests/${id}`);
  },

  // Move request to UNDER_ASSESSMENT with notes
  assessSiteServiceRequest: (id: string, adminFeedbackNotes?: string) => {
    return api.put<{ message: string; request: AdminSiteServiceRequest }>(`/admin/requests/${id}/assess`, {
      adminFeedbackNotes,
    });
  },

  // Approve request and provision official physical Site with geofence
  approveSiteServiceRequest: (id: string, payload: ApproveSiteRequestPayload) => {
    return api.post<{ message: string; request: AdminSiteServiceRequest }>(`/admin/requests/${id}/approve`, payload);
  },

  // Reject request with mandatory feedback
  rejectSiteServiceRequest: (id: string, adminFeedbackNotes: string) => {
    return api.put<{ message: string; request: AdminSiteServiceRequest }>(`/admin/requests/${id}/reject`, {
      adminFeedbackNotes,
    });
  },

  // Revert request back to PENDING_REVIEW
  revertSiteServiceRequest: (id: string, adminFeedbackNotes?: string) => {
    return api.put<{ message: string; request: AdminSiteServiceRequest }>(`/admin/requests/${id}/revert`, {
      adminFeedbackNotes,
    });
  },

  // Fetch assignable personnel for physical site visits
  getVisitAssignees: () => {
    return api.get<{ assignees: AdminVisitAssignee[] }>('/admin/requests/assignees');
  },

  // Schedule a physical site visit
  scheduleSiteVisit: (id: string, payload: { visitAssigneeId: string; visitScheduledAt: string; adminFeedbackNotes?: string | null }) => {
    return api.put<{ message: string; request: AdminSiteServiceRequest }>(`/admin/requests/${id}/schedule-visit`, payload);
  },

  // Record interim physical site survey findings and exact coordinates
  recordSiteSurveyNotes: (id: string, payload: RecordSurveyNotesPayload) => {
    return api.put<{ message: string; request: AdminSiteServiceRequest }>(`/admin/requests/${id}/survey-notes`, payload);
  },

  // Fetch all physical sites
  getAllSites: (clientId?: string) => {
    const qs = clientId ? `?clientId=${clientId}` : '';
    return api.get<{ sites: AdminSite[] }>(`/admin/sites${qs}`);
  },

  // Update physical site details or geofence
  updateSite: (id: string, payload: Partial<ApproveSiteRequestPayload> & { name?: string; address?: string }) => {
    return api.put<{ message: string; site: AdminSite }>(`/admin/sites/${id}`, payload);
  },

  // Fetch encrypted audit logs with filters, multi-field search & pagination
  getAuditLogs: (params?: AuditLogFilterParams) => {
    const query = new URLSearchParams();
    if (params?.entityType && params.entityType !== 'ALL') query.append('entityType', params.entityType);
    if (params?.action && params.action !== 'ALL') query.append('action', params.action);
    if (params?.search && params.search.trim() !== '') query.append('search', params.search.trim());
    if (params?.userId) query.append('userId', params.userId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.export) query.append('export', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{
      logs: AdminAuditLog[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
      stats: {
        total: number;
        guards: number;
        clients: number;
        sites: number;
        requests: number;
        shifts: number;
      };
    }>(`/admin/audit-logs${qs}`);
  },

  // Fetch single decrypted audit log by ID
  getAuditLogById: (id: string) => {
    return api.get<{ log: AdminAuditLog }>(`/admin/audit-logs/${id}`);
  },

  // Staff Management (Super Admin governance)
  getStaff: (params?: { search?: string; template?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search && params.search.trim() !== '') query.append('search', params.search.trim());
    if (params?.template && params.template !== 'ALL') query.append('template', params.template);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ staff: StaffMember[]; stats: StaffStats; pagination: StaffPagination }>(`/admin/staff${qs}`);
  },

  inviteStaff: (payload: InviteStaffPayload) => {
    return api.post<{ message: string; staff: StaffMember }>(`/admin/staff/invite`, payload);
  },

  updateStaffPermissions: (id: string, payload: UpdateStaffPermissionsPayload) => {
    return api.put<{ message: string; staffProfile: any }>(`/admin/staff/${id}/permissions`, payload);
  },

  toggleStaffStatus: (id: string, isActive: boolean, reason?: string) => {
    return api.put<{ message: string; isActive: boolean }>(`/admin/staff/${id}/status`, { isActive, reason });
  },

  resendStaffInvitation: (id: string) => {
    return api.post<{ message: string }>(`/admin/staff/${id}/resend-invite`, {});
  },

  getAvailablePermissions: () => {
    return api.get<{
      templates: Record<string, string[]>;
      availablePermissions: Array<{ id: string; label: string; category: string }>;
    }>('/admin/staff/permissions-schema');
  },

  deleteStaff: (id: string) => {
    return api.delete<{ message: string }>(`/admin/staff/${id}`);
  },

  // Super Admin Password Change (Settings)
  changePassword: (payload: {
    oldPassword?: string;
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    return api.put<{
      success: boolean;
      message: string;
    }>('/admin/security/change-password', payload);
  },
};



export interface AdminAuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: 'GUARD' | 'CLIENT' | 'SITE' | 'SERVICE_REQUEST' | 'SHIFT' | 'USER' | 'SYSTEM' | string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  details: {
    entityName?: string | null;
    summary?: string | null;
    previousValues?: Record<string, any> | null;
    newValues?: Record<string, any> | null;
    reason?: string | null;
    metadata?: Record<string, any> | null;
    [key: string]: any;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
}

export interface AuditLogFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: string;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  export?: boolean;
}

export type ServiceRequestType = 'NEW_SITE_DEPLOYMENT' | 'EXTRA_GUARD_COVERAGE' | 'SCHEDULE_CHANGE' | 'SPECIAL_EVENT';
export type ServiceRequestStatus = 'PENDING_REVIEW' | 'UNDER_ASSESSMENT' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ServiceRequestUrgency = 'STANDARD' | 'PRIORITY' | 'EMERGENCY';
export type VisitStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface AdminVisitAssignee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  jobTitle: string;
  department: string;
}

export interface RecordSurveyNotesPayload {
  surveyLatitude?: number | null;
  surveyLongitude?: number | null;
  surveyGeofenceRadiusMeters?: number;
  surveyContactName?: string | null;
  surveyContactPhone?: string | null;
  surveyNotes?: string | null;
  surveyConductedAt?: string | null;
}

export interface AdminSiteServiceRequest {
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
  visitStatus?: VisitStatus | null;
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
  createdAt: string;
  updatedAt: string;
  client?: ClientManagementProfile | null;
  site?: {
    id: string;
    name: string;
    address: string;
    latitude?: number | string;
    longitude?: number | string;
    geofenceRadiusMeters?: number;
    siteInstructions?: string | null;
    emergencyContact?: string | null;
  } | null;
}

export interface AdminSite {
  id: string;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  geofenceRadiusMeters: number;
  siteInstructions?: string | null;
  emergencyContact?: string | null;
  client: {
    id: string;
    companyName: string;
    logoUrl?: string | null;
    urlSlug?: string | null;
  };
  activeOfficersCount: number;
  activeShifts: Array<{
    id: string;
    guard: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string | null;
    };
  }>;
  totalShifts: number;
  totalPatrolRoutes: number;
  totalIncidents: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveSiteRequestPayload {
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  siteInstructions?: string | null;
  emergencyContact?: string | null;
  adminFeedbackNotes?: string | null;
}

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  role: 'SUPER_ADMIN' | 'SUPERVISOR';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  staffProfile: {
    id?: string;
    jobTitle: string | null;
    department: string | null;
    template: 'FULL_OPERATIONS' | 'DISPATCHER' | 'READ_ONLY' | 'CUSTOM' | string;
    permissions: string[];
    invitedAt?: string;
    acceptedAt?: string | null;
  } | null;
  invitationTokens?: Array<{
    id: string;
    expiresAt: string;
    usedAt: string | null;
    createdAt: string;
  }>;
}

export interface StaffStats {
  totalStaff: number;
  superAdminsCount: number;
  supervisorsCount: number;
  activeCount: number;
  pendingInviteCount: number;
  fullOperationsCount: number;
  dispatcherCount: number;
  readOnlyCount: number;
}

export interface StaffPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InviteStaffPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  jobTitle: string;
  department?: string | null;
  template: 'FULL_OPERATIONS' | 'DISPATCHER' | 'READ_ONLY' | 'CUSTOM';
  permissions?: string[];
}

export interface UpdateStaffPermissionsPayload {
  template?: 'FULL_OPERATIONS' | 'DISPATCHER' | 'READ_ONLY' | 'CUSTOM';
  permissions?: string[];
  jobTitle?: string | null;
  department?: string | null;
}

