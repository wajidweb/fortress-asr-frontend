import { api } from './api';

export type ShiftStatus =
  | 'SCHEDULED'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'MISSED'
  | 'ESCALATED'
  | 'CANCELLED';

export interface GuardShiftSite {
  id: string;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  geofenceRadiusMeters: number;
  siteInstructions?: string | null;
  emergencyContact?: string | null;
  client?: {
    companyName: string;
  };
}

export interface GuardShift {
  id: string;
  siteId: string;
  guardId: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  preShiftConfirmedAt?: string | null;
  checkInTime?: string | null;
  checkInLatitude?: number | string | null;
  checkInLongitude?: number | string | null;
  checkInPhotoUrl?: string | null;
  checkInSiaBadgePhoto?: string | null;
  checkInPpeVerified?: boolean;
  checkOutTime?: string | null;
  checkOutLatitude?: number | string | null;
  checkOutLongitude?: number | string | null;
  checkOutPhotoUrl?: string | null;
  guardPayRateHour: string | number;
  clientBillingRateHour: string | number;
  createdAt: string;
  updatedAt: string;
  site: GuardShiftSite;
}

export const guardService = {
  // Fetch guard's assigned shifts
  getMyShifts: (params?: { upcoming?: boolean; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.upcoming) query.append('upcoming', 'true');
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ shifts: GuardShift[] }>(`/guard/shifts/my-shifts${qs}`);
  },

  // Confirm attendance ahead of scheduled shift (Pre-Shift Confirmation)
  confirmAttendance: (shiftId: string) => {
    return api.put<{ message: string; shift: GuardShift }>(`/guard/shifts/${shiftId}/confirm`, {});
  },

  // Visual Geofenced Check-In with mandatory live camera capture
  checkIn: (shiftId: string, formData: FormData) => {
    return api.post<{ message: string; shift: GuardShift; distanceMeters: number }>(
      `/guard/shifts/${shiftId}/check-in`,
      formData
    );
  },

  // Visual Check-Out (Duty completion)
  checkOut: (shiftId: string, formData: FormData) => {
    return api.post<{ message: string; shift: GuardShift }>(
      `/guard/shifts/${shiftId}/check-out`,
      formData
    );
  },
};
