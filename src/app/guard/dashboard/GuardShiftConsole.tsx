'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { guardService, GuardShift } from '@/services/guard.service';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  FileText, 
  RotateCw, 
  ShieldCheck, 
  Info,
  ChevronRight,
  X
} from 'lucide-react';

interface GuardShiftConsoleProps {
  initialTab?: 'today' | 'upcoming' | 'history';
}

export const GuardShiftConsole: React.FC<GuardShiftConsoleProps> = ({ initialTab = 'today' }) => {
  const { user } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  const [shifts, setShifts] = useState<GuardShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'history'>(initialTab);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState<GuardShift | null>(null);

  // Fetch guard's shifts
  const fetchShifts = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await guardService.getMyShifts();
      setShifts(res.shifts || []);
    } catch (err: any) {
      console.error('Error fetching shifts:', err);
      addToast(err.message || 'Failed to retrieve your shifts.', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Handle pre-shift attendance confirmation
  const handleConfirmShift = async (shiftId: string) => {
    setConfirmingId(shiftId);
    try {
      const res = await guardService.confirmAttendance(shiftId);
      addToast('Your attendance has been confirmed! HQ notified.', 'success');
      // Update local state directly
      setShifts((prev) =>
        prev.map((s) => (s.id === shiftId ? { ...s, status: 'CONFIRMED', preShiftConfirmedAt: res.shift.preShiftConfirmedAt } : s))
      );
      if (selectedShiftForDetails?.id === shiftId) {
        setSelectedShiftForDetails((prev) => (prev ? { ...prev, status: 'CONFIRMED', preShiftConfirmedAt: res.shift.preShiftConfirmedAt } : null));
      }
    } catch (err: any) {
      console.error('Confirmation error:', err);
      addToast(err.message || 'Failed to confirm attendance.', 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  const now = new Date();

  // Next or today's active shift
  const currentOrNextShift = useMemo(() => {
    // 1. Prioritize active CHECKED_IN shift
    const active = shifts.find((s) => s.status === 'CHECKED_IN');
    if (active) return active;

    // 2. Next upcoming SCHEDULED or CONFIRMED shift
    const upcoming = shifts.find((s) => {
      const end = new Date(s.endTime);
      return end >= now && (s.status === 'SCHEDULED' || s.status === 'CONFIRMED');
    });
    if (upcoming) return upcoming;

    // 3. Fallback to latest non-cancelled shift ending in future
    return shifts.find((s) => {
      const end = new Date(s.endTime);
      return end >= now && s.status !== 'CANCELLED';
    });
  }, [shifts, now]);

  // Upcoming shifts (excluding current)
  const upcomingShifts = useMemo(() => {
    return shifts.filter((s) => {
      const start = new Date(s.startTime);
      return start > now && s.id !== currentOrNextShift?.id && s.status !== 'CANCELLED';
    });
  }, [shifts, now, currentOrNextShift]);

  // History / past completed shifts
  const pastShifts = useMemo(() => {
    return shifts.filter((s) => {
      const end = new Date(s.endTime);
      return end < now || s.status === 'CHECKED_OUT' || s.status === 'CANCELLED';
    });
  }, [shifts, now]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHoursDuration = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const hours = (e - s) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="w-full flex flex-col gap-6 font-jakarta antialiased">
      {/* Top Banner */}
      <div className="w-full bg-white border-2 border-black rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Field Terminal • Guard Console
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#032031]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#032031]">
              My Shifts & Rota
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Officer Duty Schedule</h1>
          <p className="text-xs font-semibold text-black/70">
            View your contracted site postings, confirm rostered shifts, and review site-specific instructions.
          </p>
        </div>

        {/* Tab Selector & Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${
                activeTab === 'today'
                  ? 'bg-white text-black shadow-xs border border-black/10'
                  : 'text-slate-500 hover:text-black'
              }`}
            >
              Today&apos;s Assignment
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${
                activeTab === 'upcoming'
                  ? 'bg-white text-black shadow-xs border border-black/10'
                  : 'text-slate-500 hover:text-black'
              }`}
            >
              Upcoming ({upcomingShifts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${
                activeTab === 'history'
                  ? 'bg-white text-black shadow-xs border border-black/10'
                  : 'text-slate-500 hover:text-black'
              }`}
            >
              History
            </button>
          </div>

          <button
            onClick={() => fetchShifts(true)}
            className="p-2 border-2 border-black rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Shifts"
          >
            <RotateCw className={`w-3.5 h-3.5 text-black ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white border-2 border-black rounded-xl">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Retrieving assigned shifts...
          </span>
        </div>
      ) : (
        <>
          {/* TAB 1: TODAY'S ASSIGNMENT HERO */}
          {activeTab === 'today' && (
            <div className="flex flex-col gap-6">
              {currentOrNextShift ? (
                <div className="w-full bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6 relative overflow-hidden">
                  {/* Status Ribbon */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 border border-slate-300 rounded-xl">
                        <Building className="w-5 h-5 text-[#032031]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {currentOrNextShift.site?.client?.companyName || 'Security Operations'}
                        </span>
                        <h2 className="text-xl font-black text-black">{currentOrNextShift.site?.name}</h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                          currentOrNextShift.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : currentOrNextShift.status === 'CHECKED_IN'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {currentOrNextShift.status === 'SCHEDULED' ? 'Pending Attendance Confirmation' : currentOrNextShift.status}
                      </span>
                    </div>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Shift Timing</span>
                      </div>
                      <span className="text-sm font-black text-black">
                        {formatDateTime(currentOrNextShift.startTime)}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        to {new Date(currentOrNextShift.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} ({formatHoursDuration(currentOrNextShift.startTime, currentOrNextShift.endTime)})
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Site Location</span>
                      </div>
                      <span className="text-xs font-black text-black line-clamp-1">
                        {currentOrNextShift.site?.address}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Geofence: {currentOrNextShift.site?.geofenceRadiusMeters}m boundary enforced
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Emergency Contact</span>
                      </div>
                      <span className="text-xs font-black text-black">
                        {currentOrNextShift.site?.emergencyContact || 'HQ Control Room'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        24/7 Operations Desk
                      </span>
                    </div>
                  </div>

                  {/* Site Instructions Preview */}
                  {currentOrNextShift.site?.siteInstructions && (
                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-amber-800">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          Site Standing Orders & Instructions
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                        {currentOrNextShift.site.siteInstructions}
                      </p>
                    </div>
                  )}

                  {/* Pre-Shift Attendance Confirmation Action */}
                  <div className="p-5 bg-slate-50 border-2 border-black/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#032031] shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-black uppercase tracking-wide">
                          Pre-Shift Attendance Check (BRD §2 & §5)
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {currentOrNextShift.status === 'SCHEDULED'
                            ? 'Please confirm your attendance so dispatch knows you are available and on schedule.'
                            : `Attendance confirmed on ${new Date(currentOrNextShift.preShiftConfirmedAt || currentOrNextShift.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.`}
                        </span>
                      </div>
                    </div>

                    {currentOrNextShift.status === 'SCHEDULED' ? (
                      <button
                        onClick={() => handleConfirmShift(currentOrNextShift.id)}
                        disabled={confirmingId === currentOrNextShift.id}
                        className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {confirmingId === currentOrNextShift.id ? 'Confirming...' : '✓ Confirm Shift Attendance'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black uppercase tracking-wider border border-emerald-300 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmed for Duty
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-3">
                  <Calendar className="w-10 h-10 text-slate-300" />
                  <h3 className="text-base font-black text-black uppercase tracking-wider">
                    No Active Shifts Today
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 max-w-sm">
                    You have no scheduled deployments for today. Please review the Upcoming tab for your future rostered dates.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPCOMING SHIFTS LIST */}
          {activeTab === 'upcoming' && (
            <div className="flex flex-col gap-4">
              {upcomingShifts.length === 0 ? (
                <div className="w-full bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-3">
                  <Calendar className="w-10 h-10 text-slate-300" />
                  <h3 className="text-base font-black text-black uppercase tracking-wider">
                    No Upcoming Shifts
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 max-w-sm">
                    No additional future shifts are currently rostered for your profile. Contact your Operations Supervisor if you require additional hours.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-white border-2 border-black rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-black/70 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {shift.site?.client?.companyName}
                          </span>
                          <h4 className="text-sm font-black text-black">{shift.site?.name}</h4>
                          <span className="text-[10px] font-semibold text-slate-500 line-clamp-1">
                            {shift.site?.address}
                          </span>
                        </div>
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            shift.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {shift.status}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-bold text-black">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateTime(shift.startTime)}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {formatHoursDuration(shift.startTime, shift.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <button
                          onClick={() => setSelectedShiftForDetails(shift)}
                          className="text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-black flex items-center gap-1"
                        >
                          View Site Details
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        {shift.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleConfirmShift(shift.id)}
                            disabled={confirmingId === shift.id}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer disabled:opacity-50"
                          >
                            {confirmingId === shift.id ? 'Confirming...' : 'Confirm'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHIFT HISTORY */}
          {activeTab === 'history' && (
            <div className="w-full bg-white border-2 border-black rounded-xl overflow-hidden shadow-xs">
              {pastShifts.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-slate-400">
                  No previous shift history found on record.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b-2 border-black bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <th className="p-3.5">Property</th>
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Duration</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs font-semibold">
                      {pastShifts.map((shift) => (
                        <tr key={shift.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5">
                            <div className="flex flex-col">
                              <span className="font-black text-black">{shift.site?.name}</span>
                              <span className="text-[10px] text-slate-400">{shift.site?.address}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-700">
                            {formatDateTime(shift.startTime)}
                          </td>
                          <td className="p-3.5 text-slate-700">
                            {formatHoursDuration(shift.startTime, shift.endTime)}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                shift.status === 'CHECKED_OUT'
                                  ? 'bg-slate-200 text-slate-800'
                                  : shift.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {shift.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedShiftForDetails(shift)}
                              className="text-[10px] font-black uppercase tracking-wider text-black hover:underline"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL: Shift Details */}
      {selectedShiftForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#032031]" />
                <h3 className="text-base font-black text-black uppercase tracking-wider">
                  Site Shift Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedShiftForDetails(null)}
                className="p-1 border border-black/20 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Target Site</span>
                <span className="text-sm font-black text-black">{selectedShiftForDetails.site?.name}</span>
                <span className="text-slate-600 text-[11px]">{selectedShiftForDetails.site?.address}</span>
                <span className="text-slate-500 text-[10px]">
                  Client: {selectedShiftForDetails.site?.client?.companyName} • Geofence Radius: {selectedShiftForDetails.site?.geofenceRadiusMeters}m
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Timing</span>
                  <span className="text-xs font-bold text-black">
                    {formatDateTime(selectedShiftForDetails.startTime)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Duration: {formatHoursDuration(selectedShiftForDetails.startTime, selectedShiftForDetails.endTime)}
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status</span>
                  <span className="text-xs font-bold text-emerald-800">
                    {selectedShiftForDetails.status}
                  </span>
                  {selectedShiftForDetails.preShiftConfirmedAt && (
                    <span className="text-[10px] text-slate-500">
                      Confirmed at {new Date(selectedShiftForDetails.preShiftConfirmedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {selectedShiftForDetails.site?.siteInstructions && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800">
                    Standing Instructions
                  </span>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {selectedShiftForDetails.site.siteInstructions}
                  </p>
                </div>
              )}

              {selectedShiftForDetails.site?.emergencyContact && (
                <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Site Emergency Contact
                  </span>
                  <span className="text-xs font-black text-black">
                    {selectedShiftForDetails.site.emergencyContact}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t-2 border-black/10 pt-3">
              {selectedShiftForDetails.status === 'SCHEDULED' && (
                <button
                  type="button"
                  onClick={() => handleConfirmShift(selectedShiftForDetails.id)}
                  disabled={confirmingId === selectedShiftForDetails.id}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Confirm Attendance
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedShiftForDetails(null)}
                className="ml-auto px-4 py-2 text-xs font-black uppercase tracking-wider text-black border-2 border-black rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
