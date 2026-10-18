'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { guardService, GuardShift } from '@/services/guard.service';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { GuardNavigationMap } from '@/components/maps';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  FileText, 
  RotateCw, 
  ShieldCheck, 
  Info,
  ChevronRight,
  X,
  Coins,
  Navigation,
  Shield,
  CalendarCheck,
  Check,
  Copy
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
  const [selectedLocationShift, setSelectedLocationShift] = useState<GuardShift | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLocationShift(null);
        setSelectedShiftForDetails(null);
      }
    };
    if (selectedLocationShift || selectedShiftForDetails) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLocationShift, selectedShiftForDetails]);

  // Copy site address helper
  const handleCopyAddress = (addr?: string) => {
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    addToast('Site address copied to clipboard', 'info');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Fetch guard's assigned shifts
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
      addToast('Attendance confirmed! Operations Dispatch has been notified.', 'success');
      setShifts((prev) =>
        prev.map((s) =>
          s.id === shiftId
            ? { ...s, status: 'CONFIRMED', preShiftConfirmedAt: res.shift.preShiftConfirmedAt }
            : s
        )
      );
      if (selectedShiftForDetails?.id === shiftId) {
        setSelectedShiftForDetails((prev) =>
          prev
            ? { ...prev, status: 'CONFIRMED', preShiftConfirmedAt: res.shift.preShiftConfirmedAt }
            : null
        );
      }
    } catch (err: any) {
      console.error('Confirmation error:', err);
      addToast(err.message || 'Failed to confirm attendance.', 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  const now = new Date();

  // Current or next prioritized shift
  const currentOrNextShift = useMemo(() => {
    const active = shifts.find((s) => s.status === 'CHECKED_IN');
    if (active) return active;

    const upcoming = shifts.find((s) => {
      const end = new Date(s.endTime);
      return end >= now && (s.status === 'SCHEDULED' || s.status === 'CONFIRMED');
    });
    if (upcoming) return upcoming;

    return shifts.find((s) => {
      const end = new Date(s.endTime);
      return end >= now && s.status !== 'CANCELLED';
    });
  }, [shifts, now]);

  // Shifts specifically rostered for today's date or active now
  const todayShifts = useMemo(() => {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const forToday = shifts.filter((s) => {
      if (s.status === 'CANCELLED') return false;
      if (s.status === 'CHECKED_IN') return true;
      const sStart = new Date(s.startTime);
      const sEnd = new Date(s.endTime);
      return sStart <= todayEnd && sEnd >= todayStart;
    });

    if (forToday.length > 0) return forToday;
    if (currentOrNextShift) return [currentOrNextShift];
    return [];
  }, [shifts, now, currentOrNextShift]);

  // Upcoming shifts (excluding today's shifts)
  const upcomingShifts = useMemo(() => {
    return shifts.filter((s) => {
      const start = new Date(s.startTime);
      return start > now && !todayShifts.some((ts) => ts.id === s.id) && s.status !== 'CANCELLED';
    });
  }, [shifts, now, todayShifts]);

  // History / past shifts
  const pastShifts = useMemo(() => {
    return shifts.filter((s) => {
      const end = new Date(s.endTime);
      return (end < now && !todayShifts.some((ts) => ts.id === s.id && s.status !== 'CHECKED_OUT')) || s.status === 'CHECKED_OUT' || s.status === 'CANCELLED';
    });
  }, [shifts, now, todayShifts]);

  // Summary counts
  const stats = useMemo(() => {
    const total = shifts.length;
    const activeDuty = shifts.filter((s) => s.status === 'CHECKED_IN').length;
    const completed = shifts.filter((s) => s.status === 'CHECKED_OUT').length;
    const confirmed = shifts.filter((s) => s.status === 'CONFIRMED').length;
    return { total, activeDuty, completed, confirmed };
  }, [shifts]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeOnly = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHoursDuration = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const hours = Math.max(0, (e - s) / (1000 * 60 * 60));
    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col gap-4 sm:gap-5 font-jakarta antialiased animate-fade-in select-none">
      
      {/* 1. Responsive Top Header Banner */}
      <div className="w-full bg-white border-2 border-slate-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Field Terminal • Security Post
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#032031]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#032031]">
              Deployment Console
            </span>
            {stats.activeDuty > 0 && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border-2 border-blue-300 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Active On Duty
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#032031] tracking-tight truncate">
            My Posting & Duty Schedule
          </h1>
          <p className="text-xs text-slate-500 font-semibold line-clamp-1 sm:line-clamp-none">
            Review assigned security postings, view live Leaflet GPS orientation, and check standing orders.
          </p>
        </div>

        {/* Responsive Tab Selector & Controls */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <div className="p-1 bg-slate-100 rounded-xl border-2 border-slate-300 w-full md:w-auto grid grid-cols-3 md:flex gap-1">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition truncate ${
                activeTab === 'today'
                  ? 'bg-white text-[#032031] shadow-2xs font-extrabold border-2 border-slate-300'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Today ({todayShifts.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition truncate ${
                activeTab === 'upcoming'
                  ? 'bg-white text-[#032031] shadow-2xs font-extrabold border-2 border-slate-300'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Upcoming ({upcomingShifts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition truncate ${
                activeTab === 'history'
                  ? 'bg-white text-[#032031] shadow-2xs font-extrabold border-2 border-slate-300'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              History ({pastShifts.length})
            </button>
          </div>

          <button
            onClick={() => fetchShifts(true)}
            className="p-2 border-2 border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 transition cursor-pointer shrink-0"
            title="Refresh Shift Ledger"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#032031]' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 sm:p-16 flex flex-col items-center justify-center gap-3 bg-white border-2 border-slate-300 rounded-2xl shadow-xs">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Syncing assigned posting schedules...
          </span>
        </div>
      ) : (
        <>
          {/* TAB 1: REDESIGNED TODAY'S ASSIGNMENTS TABLE LIST */}
          {activeTab === 'today' && (
            <div className="flex flex-col gap-4">
            {todayShifts.length === 0 ? (
                <div className="w-full bg-white border-2 border-slate-300 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
                  <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-400">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-[#032031] uppercase tracking-wider">
                    No Active Deployment Today
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 max-w-sm leading-relaxed">
                    You have no scheduled duty assignments for today. Please review the Upcoming tab for your upcoming rota deployments.
                  </p>
                </div>
              ) : (
                <>
                  {/* Today's Deployments Table List Card */}
                  <div className="w-full bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                    <div className="p-3.5 sm:p-4 bg-slate-50 border-b-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#032031] text-white rounded-lg">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-[#032031] tracking-tight">
                            Today&apos;s Assigned Deployments ({todayShifts.length})
                          </h3>
                          <span className="text-[10px] text-slate-500 font-semibold block sm:inline">
                            Rostered field security postings for today
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border-2 border-slate-200 self-start sm:self-auto">
                        {now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Desktop Table List */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs min-w-[760px]">
                        <thead>
                          <tr className="border-b-2 border-slate-200 bg-white text-[9px] font-black uppercase tracking-wider text-slate-500">
                            <th className="p-3.5">Facility & Client</th>
                            <th className="p-3.5">Schedule & Hours</th>
                            <th className="p-3.5 text-right">Agreed Wage</th>
                            <th className="p-3.5 text-right">Est. Gross Pay</th>
                            <th className="p-3.5 text-center">Geofence / Desk</th>
                            <th className="p-3.5 text-center">Duty Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100 font-medium">
                          {todayShifts.map((shift) => {
                            const durationHours =
                              shift.checkInTime && shift.checkOutTime
                                ? Math.max(0, (new Date(shift.checkOutTime).getTime() - new Date(shift.checkInTime).getTime()) / 3600000)
                                : Math.max(0, (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / 3600000);
                            const rate = Number(shift.guardPayRateHour) || 0;
                            const grossPay = shift.status === 'CANCELLED' ? 0 : durationHours * rate;

                            return (
                              <tr
                                key={shift.id}
                                className="hover:bg-slate-50/70 transition"
                              >
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 text-[#032031] shrink-0">
                                      <Building2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0 items-start gap-1">
                                      <span className="font-black text-sm text-[#032031] truncate">
                                        {shift.site?.name}
                                      </span>
                                      
                                      {/* Location Button */}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedLocationShift(shift)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer shadow-2xs hover:border-blue-300"
                                        title="View site location on map"
                                      >
                                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                                        <span>Location</span>
                                      </button>

                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                        {shift.site?.client?.companyName || 'Corporate Client'}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3.5 text-slate-700">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900">
                                      {formatDateTime(shift.startTime)}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      to {formatTimeOnly(shift.endTime)} ({durationHours.toFixed(1)} hrs)
                                    </span>
                                    {shift.checkInTime && (
                                      <span className="text-[9px] font-bold text-emerald-700">
                                        Clocked in: {formatTimeOnly(shift.checkInTime)}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="p-3.5 text-right font-black text-slate-800">
                                  £{rate.toFixed(2)}/hr
                                </td>

                                <td className="p-3.5 text-right font-black text-emerald-700 text-sm">
                                  £{grossPay.toFixed(2)}
                                </td>

                                <td className="p-3.5 text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                                      {shift.site?.geofenceRadiusMeters || 100}m Geofence
                                    </span>
                                    {shift.site?.emergencyContact && (
                                      <a
                                        href={`tel:${shift.site.emergencyContact}`}
                                        className="text-[9px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                                      >
                                        <Phone className="w-2.5 h-2.5" />
                                        Emergency Desk
                                      </a>
                                    )}
                                  </div>
                                </td>

                                <td className="p-3.5 text-center">
                                  <span
                                    className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border-2 ${
                                      shift.status === 'CONFIRMED'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : shift.status === 'CHECKED_IN'
                                        ? 'bg-blue-50 text-blue-800 border-blue-300 animate-pulse'
                                        : shift.status === 'CHECKED_OUT'
                                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                                        : 'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    {shift.status === 'SCHEDULED' ? 'Pending Confirm' : shift.status}
                                  </span>
                                </td>

                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {shift.status === 'SCHEDULED' && (
                                      <button
                                        onClick={() => handleConfirmShift(shift.id)}
                                        disabled={confirmingId === shift.id}
                                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition disabled:opacity-50 cursor-pointer"
                                      >
                                        {confirmingId === shift.id ? '...' : 'Confirm'}
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setSelectedLocationShift(shift)}
                                      className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer flex items-center gap-1"
                                      title="Open Location & Map Modal"
                                    >
                                      <MapPin className="w-3 h-3 text-blue-600" />
                                      Location
                                    </button>

                                    <button
                                      onClick={() => setSelectedShiftForDetails(shift)}
                                      className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-black border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                                    >
                                      Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile List View (< 768px) */}
                    <div className="block md:hidden divide-y-2 divide-slate-200">
                      {todayShifts.map((shift) => {
                        const durationHours =
                          shift.checkInTime && shift.checkOutTime
                            ? Math.max(0, (new Date(shift.checkOutTime).getTime() - new Date(shift.checkInTime).getTime()) / 3600000)
                            : Math.max(0, (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / 3600000);
                        const rate = Number(shift.guardPayRateHour) || 0;
                        const grossPay = shift.status === 'CANCELLED' ? 0 : durationHours * rate;

                        return (
                          <div
                            key={shift.id}
                            className="p-3.5 flex flex-col gap-2.5 bg-white transition hover:bg-slate-50/50"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex flex-col min-w-0 items-start gap-1">
                                <span className="text-[9px] font-black uppercase text-slate-400 truncate">
                                  {shift.site?.client?.companyName || 'Corporate Client'}
                                </span>
                                <h4 className="font-black text-sm text-[#032031] truncate">
                                  {shift.site?.name}
                                </h4>
                                
                                {/* Mobile Location Button */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedLocationShift(shift)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer shadow-2xs hover:border-blue-300"
                                  title="View site location on map"
                                >
                                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span>Location</span>
                                </button>
                              </div>

                              <span
                                className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-2 shrink-0 ${
                                  shift.status === 'CONFIRMED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : shift.status === 'CHECKED_IN'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                                }`}
                              >
                                {shift.status === 'SCHEDULED' ? 'Pending Confirm' : shift.status}
                              </span>
                            </div>

                            {/* Metrics Strip */}
                            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border-2 border-slate-200 text-center text-xs">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-slate-400">Duration</span>
                                <span className="font-bold text-slate-900">{durationHours.toFixed(1)}h</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-slate-400">Agreed Rate</span>
                                <span className="font-bold text-slate-900">£{rate.toFixed(2)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-slate-400">Est. Pay</span>
                                <span className="font-black text-emerald-700">£{grossPay.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Schedule & Buttons */}
                            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                              <span className="text-[10px] text-slate-500 font-semibold">
                                {formatDateTime(shift.startTime)}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {shift.status === 'SCHEDULED' && (
                                  <button
                                    onClick={() => handleConfirmShift(shift.id)}
                                    disabled={confirmingId === shift.id}
                                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                                  >
                                    Confirm
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelectedLocationShift(shift)}
                                  className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                                >
                                  <MapPin className="w-3 h-3 text-blue-600" />
                                  Location
                                </button>
                                <button
                                  onClick={() => setSelectedShiftForDetails(shift)}
                                  className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition"
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: COMPACT UPCOMING SHIFTS LIST */}
          {activeTab === 'upcoming' && (
            <div className="flex flex-col gap-3 w-full">
              {upcomingShifts.length === 0 ? (
                <div className="w-full bg-white border-2 border-slate-300 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
                  <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-400">
                    <CalendarCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-[#032031] uppercase tracking-wider">
                    No Upcoming Shifts Rostered
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 max-w-sm leading-relaxed">
                    No additional future shifts are rostered on your rota at this moment. Contact your Operations Supervisor if you require additional hours.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  {upcomingShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="w-full bg-white border-2 border-slate-300 rounded-xl p-3 sm:px-4 sm:py-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-400 transition"
                    >
                      {/* Left: Property & Client Information */}
                      <div className="flex items-center gap-2.5 min-w-0 sm:w-5/12">
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[#032031] shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0 items-start gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                              {shift.site?.client?.companyName || 'Corporate Client'}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              • #{shift.id.slice(0, 6)}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-[#032031] truncate leading-tight">
                            {shift.site?.name}
                          </h4>
                          
                          {/* Location Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedLocationShift(shift)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer shadow-2xs hover:border-blue-300"
                            title="View site location on map"
                          >
                            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>Location</span>
                          </button>
                        </div>
                      </div>

                      {/* Middle: Timing & Pay (Compact horizontal) */}
                      <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap sm:w-4/12 justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-slate-500 text-[9px] font-black uppercase">
                            <Clock className="w-3 h-3" />
                            <span>Schedule</span>
                          </div>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {formatDateTime(shift.startTime)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {formatHoursDuration(shift.startTime, shift.endTime)}
                          </span>
                        </div>

                        <div className="flex flex-col sm:text-right">
                          <div className="flex items-center gap-1 text-emerald-800 text-[9px] font-black uppercase sm:justify-end">
                            <Coins className="w-3 h-3 text-emerald-700" />
                            <span>Agreed Pay</span>
                          </div>
                          <span className="text-xs font-black text-[#032031]">
                            £{Number(shift.guardPayRateHour || 0).toFixed(2)}/hr
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            Est: £{(
                              Number(shift.guardPayRateHour || 0) *
                              Math.max(0, (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / 3600000)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status & Action Buttons */}
                      <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0 sm:w-3/12 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-2 shrink-0 ${
                            shift.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {shift.status === 'SCHEDULED' ? 'Pending Confirm' : shift.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLocationShift(shift)}
                            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:text-black border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                            title="Open Location Modal"
                          >
                            <MapPin className="w-3 h-3 text-blue-600" />
                            Location
                          </button>

                          <button
                            onClick={() => setSelectedShiftForDetails(shift)}
                            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:text-black border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                          >
                            Details
                          </button>

                          {shift.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleConfirmShift(shift.id)}
                              disabled={confirmingId === shift.id}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer disabled:opacity-50"
                            >
                              {confirmingId === shift.id ? '...' : 'Confirm'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHIFT HISTORY */}
          {activeTab === 'history' && (
            <div className="w-full bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-xs">
              {pastShifts.length === 0 ? (
                <div className="p-12 text-center text-xs font-semibold text-slate-400">
                  No previous duty shift records on file.
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-600">
                          <th className="p-3.5">Property & Client</th>
                          <th className="p-3.5">Shift Date & Schedule</th>
                          <th className="p-3.5 text-center">Verified Hours</th>
                          <th className="p-3.5 text-right">Agreed Rate</th>
                          <th className="p-3.5 text-right">Gross Pay</th>
                          <th className="p-3.5 text-center">Duty Status</th>
                          <th className="p-3.5 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-100 font-medium">
                        {pastShifts.map((shift) => {
                          const durationHours =
                            shift.checkInTime && shift.checkOutTime
                              ? Math.max(0, (new Date(shift.checkOutTime).getTime() - new Date(shift.checkInTime).getTime()) / 3600000)
                              : Math.max(0, (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / 3600000);
                          const rate = Number(shift.guardPayRateHour) || 0;
                          const grossPay = shift.status === 'CANCELLED' ? 0 : durationHours * rate;

                          return (
                            <tr key={shift.id} className="hover:bg-slate-50/70 transition">
                              <td className="p-3.5">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="font-black text-[#032031] text-xs truncate max-w-xs">{shift.site?.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLocationShift(shift)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition cursor-pointer shadow-2xs hover:border-blue-300"
                                    title="View site location on map"
                                  >
                                    <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                    <span>Location</span>
                                  </button>
                                </div>
                              </td>

                              <td className="p-3.5 text-slate-700">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900">{formatDateTime(shift.startTime)}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    to {formatTimeOnly(shift.endTime)}
                                  </span>
                                </div>
                              </td>

                              <td className="p-3.5 text-center">
                                <span className="font-mono font-black text-slate-900">
                                  {durationHours.toFixed(1)} hrs
                                </span>
                                {shift.checkInTime && shift.checkOutTime && (
                                  <span className="block text-[8px] font-black uppercase text-emerald-700">
                                    Clocked
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5 text-right font-black text-slate-800">
                                {rate > 0 ? `£${rate.toFixed(2)}/hr` : '—'}
                              </td>

                              <td className="p-3.5 text-right">
                                <span className="font-black text-emerald-700 text-sm">
                                  £{grossPay.toFixed(2)}
                                </span>
                              </td>

                              <td className="p-3.5 text-center">
                                <span
                                  className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-2 ${
                                    shift.status === 'CHECKED_OUT'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : shift.status === 'CANCELLED'
                                      ? 'bg-red-50 text-red-800 border-red-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {shift.status}
                                </span>
                              </td>

                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => setSelectedShiftForDetails(shift)}
                                  className="text-[10px] font-black uppercase tracking-wider text-slate-700 hover:text-black hover:underline cursor-pointer"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View for Screen Sizes Under 768px */}
                  <div className="block md:hidden divide-y-2 divide-slate-200">
                    {pastShifts.map((shift) => {
                      const durationHours =
                        shift.checkInTime && shift.checkOutTime
                          ? Math.max(0, (new Date(shift.checkOutTime).getTime() - new Date(shift.checkInTime).getTime()) / 3600000)
                          : Math.max(0, (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / 3600000);
                      const rate = Number(shift.guardPayRateHour) || 0;
                      const grossPay = shift.status === 'CANCELLED' ? 0 : durationHours * rate;

                      return (
                        <div key={shift.id} className="p-3.5 flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col min-w-0 items-start gap-1">
                              <span className="font-black text-sm text-[#032031] truncate">{shift.site?.name}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedLocationShift(shift)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition cursor-pointer shadow-2xs hover:border-blue-300"
                                title="View site location on map"
                              >
                                <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                <span>Location</span>
                              </button>
                            </div>
                            <span
                              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-2 shrink-0 ${
                                shift.status === 'CHECKED_OUT'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : shift.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {shift.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border-2 border-slate-200 text-center text-xs">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-slate-400">Duration</span>
                              <span className="font-bold text-slate-900">{durationHours.toFixed(1)}h</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-slate-400">Rate</span>
                              <span className="font-bold text-slate-900">£{rate.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-slate-400">Gross Pay</span>
                              <span className="font-black text-emerald-700">£{grossPay.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <span className="text-[10px] text-slate-500 font-medium">
                              {formatDateTime(shift.startTime)}
                            </span>
                            <button
                              onClick={() => setSelectedShiftForDetails(shift)}
                              className="text-[10px] font-black uppercase tracking-wider text-[#032031] underline cursor-pointer"
                            >
                              Inspect Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* 2. RESPONSIVE COMPREHENSIVE SHIFT & SITE DETAILS MODAL */}
      {selectedShiftForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border-2 border-slate-300 rounded-2xl w-full max-w-lg sm:max-w-xl p-4 sm:p-6 shadow-xl flex flex-col gap-4 my-auto animate-fade-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-slate-100 text-[#032031] rounded-xl border-2 border-slate-300 shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
                    Posting Intelligence & Standing Orders
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#032031] truncate">
                    {selectedShiftForDetails.site?.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedShiftForDetails(null)}
                className="p-1.5 border-2 border-slate-300 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="flex flex-col gap-3.5 text-xs font-semibold">
              
              {/* Site Location & GPS */}
              <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl flex flex-col gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Property Location & Coordinates
                </span>
                <span className="text-sm font-bold text-slate-900 leading-snug">
                  {selectedShiftForDetails.site?.address}
                </span>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap pt-1 border-t-2 border-slate-200">
                  <span>Client: <strong className="text-slate-800">{selectedShiftForDetails.site?.client?.companyName || 'Corporate Client'}</strong></span>
                  <span>•</span>
                  <span>Geofence Boundary: <strong className="text-slate-800">{selectedShiftForDetails.site?.geofenceRadiusMeters || 100}m</strong></span>
                  {selectedShiftForDetails.site?.latitude && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-600">
                        GPS: {Number(selectedShiftForDetails.site.latitude).toFixed(4)}, {Number(selectedShiftForDetails.site.longitude).toFixed(4)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Leaflet Perimeter Map Preview in Modal */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Geofence Perimeter & Interactive Navigation Map
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">
                    Zoom & GPS Route Enabled
                  </span>
                </div>
                <GuardNavigationMap
                  siteLatitude={Number(selectedShiftForDetails.site?.latitude) || 51.5074}
                  siteLongitude={Number(selectedShiftForDetails.site?.longitude) || -0.1278}
                  siteRadiusMeters={selectedShiftForDetails.site?.geofenceRadiusMeters || 100}
                  propertyName={selectedShiftForDetails.site?.name}
                  address={selectedShiftForDetails.site?.address}
                  className="h-[180px] sm:h-[220px]"
                />
              </div>

              {/* Timing & Pay Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 border-2 border-slate-200 rounded-xl flex flex-col gap-1 bg-white">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Rostered Schedule</span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {formatDateTime(selectedShiftForDetails.startTime)}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">
                    to {formatTimeOnly(selectedShiftForDetails.endTime)} ({formatHoursDuration(selectedShiftForDetails.startTime, selectedShiftForDetails.endTime)})
                  </span>
                </div>

                <div className="p-3 border-2 border-slate-200 rounded-xl flex flex-col gap-1 bg-white">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Guaranteed Officer Wage</span>
                  <span className="text-xs font-black text-slate-900 truncate">
                    £{Number(selectedShiftForDetails.guardPayRateHour || 0).toFixed(2)} / hour
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 truncate">
                    Shift Value: £{(
                      Number(selectedShiftForDetails.guardPayRateHour || 0) *
                      Math.max(0, (new Date(selectedShiftForDetails.endTime).getTime() - new Date(selectedShiftForDetails.startTime).getTime()) / 3600000)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status & Clock Times (if applicable) */}
              <div className="p-3 border-2 border-slate-200 rounded-xl flex flex-col gap-2 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                    Attendance Verification
                  </span>
                  <span
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-2 ${
                      selectedShiftForDetails.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : selectedShiftForDetails.status === 'CHECKED_IN'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : selectedShiftForDetails.status === 'CHECKED_OUT'
                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {selectedShiftForDetails.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold">Clock-In Time</span>
                    <span className="font-bold text-slate-800">
                      {selectedShiftForDetails.checkInTime ? formatDateTime(selectedShiftForDetails.checkInTime) : 'Not Clocked In'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold">Clock-Out Time</span>
                    <span className="font-bold text-slate-800">
                      {selectedShiftForDetails.checkOutTime ? formatDateTime(selectedShiftForDetails.checkOutTime) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Standing Instructions */}
              {selectedShiftForDetails.site?.siteInstructions && (
                <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-amber-900">
                    <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Standing Site Instructions & Security Protocol
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed whitespace-pre-wrap pl-5 max-h-24 overflow-y-auto">
                    {selectedShiftForDetails.site.siteInstructions}
                  </p>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedShiftForDetails.site?.emergencyContact && (
                <div className="p-3 border-2 border-slate-200 rounded-xl flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-xs text-slate-700 font-bold truncate">
                      Emergency Desk: <strong className="text-black">{selectedShiftForDetails.site.emergencyContact}</strong>
                    </span>
                  </div>
                  <a
                    href={`tel:${selectedShiftForDetails.site.emergencyContact}`}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-[10px] font-black uppercase tracking-wider rounded-lg transition shrink-0"
                  >
                    Call Now
                  </a>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t-2 border-slate-200 pt-3 flex-wrap gap-2">
              {selectedShiftForDetails.status === 'SCHEDULED' && (
                <button
                  type="button"
                  onClick={() => handleConfirmShift(selectedShiftForDetails.id)}
                  disabled={confirmingId === selectedShiftForDetails.id}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Confirm Attendance
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedShiftForDetails(null)}
                className="ml-auto px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. DEDICATED SITE LOCATION & GEOFENCE MODAL */}
      {selectedLocationShift && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLocationShift(null);
          }}
        >
          <div className="bg-white border-2 border-slate-300 rounded-2xl w-full max-w-lg sm:max-w-xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto animate-fade-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-[#032031] text-white rounded-xl shadow-xs shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
                    Property Location & Geofence
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#032031] truncate">
                    {selectedLocationShift.site?.name || 'Assigned Site'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedLocationShift(null)}
                className="p-1.5 border-2 border-slate-300 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer shrink-0"
                title="Close location modal"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="flex flex-col gap-3.5 text-xs font-semibold">
              
              {/* Site Address Card */}
              <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                    Physical Site Address
                  </span>
                  {selectedLocationShift.site?.client?.companyName && (
                    <span className="text-[9px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 truncate">
                      {selectedLocationShift.site.client.companyName}
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {selectedLocationShift.site?.address || 'Address not specified'}
                  </p>
                  {selectedLocationShift.site?.address && (
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(selectedLocationShift.site?.address)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-black bg-white hover:bg-slate-100 border border-slate-300 px-2 py-1 rounded-md transition cursor-pointer shrink-0"
                      title="Copy address"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* GPS Coordinates & Geofence Boundary */}
                <div className="flex items-center gap-2.5 text-[10px] text-slate-600 flex-wrap pt-2 border-t border-slate-200">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Shield className="w-3 h-3 text-slate-500" />
                    Geofence: <strong className="text-slate-900">{selectedLocationShift.site?.geofenceRadiusMeters || 100}m radius</strong>
                  </span>
                  {selectedLocationShift.site?.latitude && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-600">
                        GPS: {Number(selectedLocationShift.site.latitude).toFixed(4)}, {Number(selectedLocationShift.site.longitude).toFixed(4)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Interactive Navigation Map */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-[#032031]" />
                    Interactive Geofence & Navigation Map
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    Live Geofence Boundary
                  </span>
                </div>
                <GuardNavigationMap
                  siteLatitude={Number(selectedLocationShift.site?.latitude) || 51.5074}
                  siteLongitude={Number(selectedLocationShift.site?.longitude) || -0.1278}
                  siteRadiusMeters={selectedLocationShift.site?.geofenceRadiusMeters || 100}
                  propertyName={selectedLocationShift.site?.name}
                  address={selectedLocationShift.site?.address}
                  className="h-[220px] sm:h-[260px]"
                />
              </div>

              {/* Emergency Contact */}
              {selectedLocationShift.site?.emergencyContact && (
                <div className="p-3 border-2 border-slate-200 rounded-xl flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-xs text-slate-700 font-bold truncate">
                      Emergency Desk: <strong className="text-black">{selectedLocationShift.site.emergencyContact}</strong>
                    </span>
                  </div>
                  <a
                    href={`tel:${selectedLocationShift.site.emergencyContact}`}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg transition shrink-0"
                  >
                    Call Desk
                  </a>
                </div>
              )}

              {/* Standing Instructions / Orders (if any) */}
              {selectedLocationShift.site?.siteInstructions && (
                <div className="p-3 bg-amber-50/70 border-2 border-amber-300 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-amber-900">
                    <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Standing Site Access Orders
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed whitespace-pre-wrap pl-5 max-h-20 overflow-y-auto">
                    {selectedLocationShift.site.siteInstructions}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end border-t-2 border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setSelectedLocationShift(null)}
                className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
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

export default GuardShiftConsole;
