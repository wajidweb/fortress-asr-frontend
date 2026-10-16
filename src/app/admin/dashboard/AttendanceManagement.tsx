'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService, AdminShift } from '@/services/admin.service';
import { getFullImageUrl } from '@/services/api';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building, 
  MapPin, 
  RotateCw, 
  ShieldCheck, 
  ExternalLink, 
  Camera, 
  Search, 
  X,
  Phone,
  Eye,
  Filter
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);

  const [shifts, setShifts] = useState<AdminShift[]>([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    onSiteNow: 0,
    lateCheckIns: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected shift for photo evidence inspection
  const [inspectedShift, setInspectedShift] = useState<AdminShift | null>(null);

  const fetchAttendance = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await adminService.getLiveAttendance();
      setShifts(res.shifts || []);
      setStats(res.stats || { totalToday: 0, onSiteNow: 0, lateCheckIns: 0, completedToday: 0 });
    } catch (err: any) {
      console.error('Error fetching live attendance:', err);
      addToast(err.message || 'Failed to load live attendance feed.', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAttendance();
    // Poll every 30 seconds for live control room monitoring
    const pollInterval = setInterval(() => {
      fetchAttendance(true);
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchAttendance]);

  const now = new Date();

  // Filtered shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      // Status filter
      if (statusFilter === 'CHECKED_IN' && s.status !== 'CHECKED_IN') return false;
      if (statusFilter === 'CHECKED_OUT' && s.status !== 'CHECKED_OUT') return false;
      if (statusFilter === 'LATE') {
        const isLate =
          (s.status === 'SCHEDULED' || s.status === 'CONFIRMED') &&
          (now.getTime() - new Date(s.startTime).getTime()) / (60 * 1000) > 15;
        if (!isLate) return false;
      }
      if (statusFilter === 'SCHEDULED' && s.status !== 'SCHEDULED' && s.status !== 'CONFIRMED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const guardName = `${s.guard?.firstName} ${s.guard?.lastName}`.toLowerCase();
        const siteName = s.site?.name.toLowerCase();
        const clientName = (s.site?.client?.companyName || '').toLowerCase();
        return guardName.includes(q) || siteName.includes(q) || clientName.includes(q);
      }

      return true;
    });
  }, [shifts, statusFilter, searchQuery, now]);

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '—';
    return new Date(timeStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full flex flex-col gap-6 font-jakarta antialiased">
      {/* Header Banner */}
      <div className="w-full bg-white border-2 border-black rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Operations Control • Attendance
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              Live Operations Feed
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Live Guard Attendance & Presence</h1>
          <p className="text-xs font-semibold text-black/70">
            Monitor on-site officer deployments, late check-in alerts, geofence compliance, and visual check-in evidence.
          </p>
        </div>

        <button
          onClick={() => fetchAttendance(true)}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-black text-black text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-50 transition cursor-pointer shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: On-Site Now */}
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Guards On-Site Right Now
            </span>
            <span className="text-2xl font-black text-emerald-700">{stats.onSiteNow}</span>
            <span className="text-[9px] font-bold text-emerald-600">Active within geofence</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
        </div>

        {/* Card 2: Late / Overdue Check-Ins */}
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Late Check-In Alerts
            </span>
            <span className="text-2xl font-black text-red-700">{stats.lateCheckIns}</span>
            <span className="text-[9px] font-bold text-red-600">&gt;15 min past start time</span>
          </div>
          <div className="p-3 bg-red-50 border border-red-300 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-700" />
          </div>
        </div>

        {/* Card 3: Completed Shifts Today */}
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Completed Shifts Today
            </span>
            <span className="text-2xl font-black text-[#032031]">{stats.completedToday}</span>
            <span className="text-[9px] font-bold text-slate-500">Checked out & billable</span>
          </div>
          <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-[#032031]" />
          </div>
        </div>

        {/* Card 4: Total Deployments Today */}
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Roster Today
            </span>
            <span className="text-2xl font-black text-black">{stats.totalToday}</span>
            <span className="text-[9px] font-bold text-slate-500">Scheduled operations</span>
          </div>
          <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
            <Users className="w-6 h-6 text-slate-700" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="w-full bg-white border-2 border-black rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-grow max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by officer name, property, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold border-2 border-black/20 rounded-lg focus:border-black focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CHECKED_IN">On-Site (Checked In)</option>
            <option value="LATE">Late Check-Ins</option>
            <option value="SCHEDULED">Pending Arrival</option>
            <option value="CHECKED_OUT">Completed (Checked Out)</option>
          </select>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="w-full bg-white border-2 border-black rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <LoaderRectangle />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Loading live attendance data...
            </span>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="p-16 text-center text-xs font-bold text-slate-400">
            No shift attendance records match the selected filters for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-black bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="p-3.5">Security Officer</th>
                  <th className="p-3.5">Contracted Property</th>
                  <th className="p-3.5">Shift Window</th>
                  <th className="p-3.5">Duty Status</th>
                  <th className="p-3.5">Check-In Evidence</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-semibold">
                {filteredShifts.map((shift) => {
                  const isLate =
                    (shift.status === 'SCHEDULED' || shift.status === 'CONFIRMED') &&
                    (now.getTime() - new Date(shift.startTime).getTime()) / (60 * 1000) > 15;

                  return (
                    <tr key={shift.id} className="hover:bg-slate-50/60 transition">
                      {/* Officer Column */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-black text-black">
                            {shift.guard?.firstName} {shift.guard?.lastName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            SIA: {shift.guard?.siaLicenceNumber || 'Verified'}
                          </span>
                        </div>
                      </td>

                      {/* Property Column */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-black text-black">{shift.site?.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {shift.site?.client?.companyName} • {shift.site?.geofenceRadiusMeters}m geofence
                          </span>
                        </div>
                      </td>

                      {/* Shift Timing */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="text-slate-800">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Scheduled today
                          </span>
                        </div>
                      </td>

                      {/* Duty Status */}
                      <td className="p-3.5">
                        {shift.status === 'CHECKED_IN' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase border border-emerald-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            On-Site Active
                          </div>
                        ) : isLate ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-[9px] font-black uppercase border border-red-300">
                            <AlertTriangle className="w-3 h-3 text-red-700" />
                            Overdue Check-In
                          </div>
                        ) : shift.status === 'CHECKED_OUT' ? (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[9px] font-black uppercase border border-slate-300">
                            Completed ({formatTime(shift.checkOutTime)})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[9px] font-black uppercase border border-amber-300">
                            {shift.status === 'CONFIRMED' ? 'Confirmed • Pending' : 'Scheduled'}
                          </span>
                        )}
                      </td>

                      {/* Check-In Evidence */}
                      <td className="p-3.5">
                        {shift.checkInTime ? (
                          <div className="flex items-center gap-2">
                            {shift.checkInPhotoUrl ? (
                              <button
                                onClick={() => setInspectedShift(shift)}
                                className="group relative cursor-pointer"
                                title="Click to view live selfie capture"
                              >
                                <img
                                  src={getFullImageUrl(shift.checkInPhotoUrl)}
                                  alt="Check-in Photo"
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-300 group-hover:ring-2 group-hover:ring-black transition"
                                />
                                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </button>
                            ) : (
                              <Camera className="w-4 h-4 text-slate-400" />
                            )}
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-black">
                                In at {formatTime(shift.checkInTime)}
                              </span>
                              <span className="text-[9px] font-semibold text-emerald-700">
                                Geofence Verified ✓
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No check-in yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        {shift.checkInPhotoUrl ? (
                          <button
                            onClick={() => setInspectedShift(shift)}
                            className="px-3 py-1.5 border border-black/20 hover:border-black rounded-lg text-[10px] font-black uppercase tracking-wider text-black transition cursor-pointer"
                          >
                            View Evidence
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Inspection of Check-In Evidence Photo & Metadata */}
      {inspectedShift && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#032031]" />
                <h3 className="text-base font-black text-black uppercase tracking-wider">
                  Check-In Proof of Presence
                </h3>
              </div>
              <button
                onClick={() => setInspectedShift(null)}
                className="p-1 border border-black/20 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Photo Capture Frame */}
            <div className="w-full h-64 bg-black rounded-xl overflow-hidden border-2 border-black/20 flex items-center justify-center">
              {inspectedShift.checkInPhotoUrl ? (
                <img
                  src={getFullImageUrl(inspectedShift.checkInPhotoUrl)}
                  alt="Verified Live Camera Selfie"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-white">No photo on record</span>
              )}
            </div>

            {/* Evidence Metadata */}
            <div className="flex flex-col gap-2 text-xs font-semibold">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-slate-400">Officer</span>
                  <span className="text-black font-black">
                    {inspectedShift.guard?.firstName} {inspectedShift.guard?.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-slate-400">Target Site</span>
                  <span className="text-black font-bold">{inspectedShift.site?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-slate-400">Timestamp</span>
                  <span className="text-black">
                    {inspectedShift.checkInTime
                      ? new Date(inspectedShift.checkInTime).toLocaleString('en-GB')
                      : 'N/A'}
                  </span>
                </div>
                {inspectedShift.checkInLatitude && (
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400">Coordinates</span>
                    <span className="text-slate-600 font-mono text-[10px]">
                      {Number(inspectedShift.checkInLatitude).toFixed(6)},{' '}
                      {Number(inspectedShift.checkInLongitude).toFixed(6)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-[10px] font-bold">
                  Verified within {inspectedShift.site?.geofenceRadiusMeters}m geofence perimeter.
                </span>
              </div>
            </div>

            <button
              onClick={() => setInspectedShift(null)}
              className="w-full py-2.5 bg-black text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              Close Evidence Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
