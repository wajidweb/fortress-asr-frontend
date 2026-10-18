'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  adminService, 
  AdminShift, 
  AdminSite, 
  GuardProfile, 
  EligibleGuard, 
  ShiftStatus,
  ShiftPricingSuggestion
} from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore, hasPermission } from '@/store/useAuthStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle, 
  Building, 
  CheckCircle2, 
  X, 
  Search, 
  DollarSign, 
  Layers, 
  AlertCircle,
  Phone,
  Ban,
  Coins
} from 'lucide-react';

type GridViewMode = 'BY_SITE' | 'BY_GUARD';

// Helper to format date strings
const formatDateHeader = (d: Date) => {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

const formatTimeRange = (start: string, end: string) => {
  const s = new Date(start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const e = new Date(end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${s} - ${e}`;
};

const getShiftDurationHours = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(0, (e - s) / (1000 * 60 * 60));
};

export const RotaManagement: React.FC = () => {
  const { user } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  const canWriteShifts = hasPermission(user, 'shifts:write');
  const canDispatchShifts = hasPermission(user, 'shifts:dispatch');

  // View state
  const [viewMode, setViewMode] = useState<GridViewMode>('BY_SITE');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Data states
  const [shifts, setShifts] = useState<AdminShift[]>([]);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [guards, setGuards] = useState<GuardProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterSiteId, setFilterSiteId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState<AdminShift | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Create Shift Form state
  const [formSiteId, setFormSiteId] = useState('');
  const [formGuardId, setFormGuardId] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('20:00');
  const [formGuardPayRate, setFormGuardPayRate] = useState<string>('');
  const [formClientBillingRate, setFormClientBillingRate] = useState<string>('');
  const [pricingSuggestion, setPricingSuggestion] = useState<ShiftPricingSuggestion | null>(null);
  const [eligibleGuards, setEligibleGuards] = useState<EligibleGuard[]>([]);
  const [loadingGuards, setLoadingGuards] = useState(false);
  const [travelWarning, setTravelWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate the 7 days of the selected week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const day = curr.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(curr.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [selectedDate]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const end = weekDays[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} — ${end}`;
  }, [weekDays]);

  // Fetch all rota data
  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const startDate = weekDays[0].toISOString();
      const endOfWeek = new Date(weekDays[6]);
      endOfWeek.setHours(23, 59, 59, 999);
      const endDate = endOfWeek.toISOString();

      const [shiftsRes, sitesRes, guardsRes] = await Promise.all([
        adminService.getShifts({
          startDate,
          endDate,
          siteId: filterSiteId !== 'ALL' ? filterSiteId : undefined,
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
        }),
        adminService.getAllSites(),
        adminService.getGuards({ status: 'ACTIVE', limit: 100 }),
      ]);

      setShifts(shiftsRes.shifts || []);
      setSites(sitesRes.sites || []);
      setGuards(guardsRes.guards || []);
    } catch (err: any) {
      console.error('Error loading rota data:', err);
      addToast(err.message || 'Failed to load rota schedule', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [weekDays, filterSiteId, filterStatus, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigate weeks
  const handlePrevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d);
  };

  const handleCurrentWeek = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setSelectedDate(d);
  };

  // Open Create Modal from a specific cell
  const handleOpenCreateModal = (siteId?: string, guardId?: string, date?: Date) => {
    if (siteId) setFormSiteId(siteId);
    else if (sites.length > 0) setFormSiteId(sites[0].id);

    if (guardId) setFormGuardId(guardId);
    else setFormGuardId('');

    if (date) {
      setFormDate(date.toISOString().split('T')[0]);
    } else {
      setFormDate(new Date().toISOString().split('T')[0]);
    }
    setFormStartTime('08:00');
    setFormEndTime('20:00');
    setFormGuardPayRate('');
    setFormClientBillingRate('');
    setPricingSuggestion(null);
    setTravelWarning(null);
    setIsCreateModalOpen(true);
  };

  // Fetch eligible guards dynamically whenever site, date, start, or end time changes in the form
  useEffect(() => {
    if (!isCreateModalOpen || !formSiteId || !formDate || !formStartTime || !formEndTime) {
      return;
    }

    const startDateTime = new Date(`${formDate}T${formStartTime}:00`);
    let endDateTime = new Date(`${formDate}T${formEndTime}:00`);

    // Handle overnight shifts (e.g. 20:00 to 06:00 next day)
    if (endDateTime <= startDateTime) {
      endDateTime = new Date(endDateTime.getTime() + 24 * 60 * 60 * 1000);
    }

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setEligibleGuards([]);
      return;
    }

    let isMounted = true;
    setLoadingGuards(true);
    setTravelWarning(null);

    adminService
      .getEligibleGuards({
        siteId: formSiteId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      })
      .then((res) => {
        if (!isMounted) return;
        setEligibleGuards(res.guards || []);
        if (res.pricing) {
          setPricingSuggestion(res.pricing);
          setFormClientBillingRate((prev) => (prev !== '' ? prev : res.pricing!.suggestedClientBillingRate.toFixed(2)));
        }
        // Check if previously selected guard has a site-specific rate or travel warning
        if (formGuardId) {
          const selected = res.guards?.find((g) => g.id === formGuardId);
          if (selected) {
            setFormGuardPayRate((prev) => (prev !== '' ? prev : Number(selected.payRatePerHour).toFixed(2)));
            if (selected.travelWarning) {
              setTravelWarning(selected.travelWarning);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Failed to evaluate guards:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingGuards(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isCreateModalOpen, formSiteId, formDate, formStartTime, formEndTime, formGuardId]);

  // Handle Guard Selection in form
  const handleGuardChange = (guardId: string) => {
    setFormGuardId(guardId);
    const chosen = eligibleGuards.find((g) => g.id === guardId);
    if (chosen) {
      setFormGuardPayRate(Number(chosen.payRatePerHour).toFixed(2));
      if (chosen.travelWarning) {
        setTravelWarning(chosen.travelWarning);
      } else {
        setTravelWarning(null);
      }
    }
  };

  // Handle Shift Creation Submission
  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiteId || !formGuardId || !formDate || !formStartTime || !formEndTime) {
      addToast('Please complete all shift timing and assignment fields.', 'error');
      return;
    }

    const startDateTime = new Date(`${formDate}T${formStartTime}:00`);
    let endDateTime = new Date(`${formDate}T${formEndTime}:00`);

    // Advance end date if shift crosses midnight (overnight shift)
    if (endDateTime <= startDateTime) {
      endDateTime = new Date(endDateTime.getTime() + 24 * 60 * 60 * 1000);
    }

    setIsSubmitting(true);
    try {
      const res = await adminService.createShift({
        siteId: formSiteId,
        guardId: formGuardId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        guardPayRateHour: formGuardPayRate ? parseFloat(formGuardPayRate) : undefined,
        clientBillingRateHour: formClientBillingRate ? parseFloat(formClientBillingRate) : undefined,
      });

      addToast(res.message || 'Shift scheduled successfully!', 'success');
      if (res.travelWarning) {
        addToast(`Notice: ${res.travelWarning}`, 'info');
      }

      setIsCreateModalOpen(false);
      fetchData(true);
    } catch (err: any) {
      console.error('Error creating shift:', err);
      addToast(err.message || 'Failed to schedule shift', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel shift
  const handleCancelShift = async () => {
    if (!selectedShiftForDetails) return;
    if (!confirm('Are you sure you want to cancel this scheduled shift?')) return;

    setIsCancelling(true);
    try {
      await adminService.cancelShift(selectedShiftForDetails.id);
      addToast('Shift has been cancelled successfully.', 'success');
      setSelectedShiftForDetails(null);
      fetchData(true);
    } catch (err: any) {
      console.error('Error cancelling shift:', err);
      addToast(err.message || 'Failed to cancel shift', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Filtered rows
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      if (filterSiteId !== 'ALL' && site.id !== filterSiteId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return site.name.toLowerCase().includes(q) || site.client.companyName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sites, filterSiteId, searchQuery]);

  const filteredGuards = useMemo(() => {
    return guards.filter((guard) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${guard.firstName} ${guard.lastName}`.toLowerCase();
        return fullName.includes(q) || (guard.siaLicenceNumber && guard.siaLicenceNumber.toLowerCase().includes(q));
      }
      return true;
    });
  }, [guards, searchQuery]);

  // Helper to match shifts to a date column and an entity row
  const getShiftsForCell = (date: Date, entityId: string, mode: GridViewMode) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    return shifts.filter((s) => {
      const shiftDate = new Date(s.startTime);
      const isSameDay =
        shiftDate.getFullYear() === year && shiftDate.getMonth() === month && shiftDate.getDate() === day;

      if (!isSameDay) return false;
      if (mode === 'BY_SITE') return s.siteId === entityId;
      return s.guardId === entityId;
    });
  };

  // Summary statistics for active week (operational & commercial pricing)
  const weekStats = useMemo(() => {
    const totalCount = shifts.length;
    const confirmedCount = shifts.filter((s) => s.status === 'CONFIRMED' || s.status === 'CHECKED_IN').length;
    let totalHours = 0;
    let totalBilling = 0;
    let totalWages = 0;

    shifts.forEach((s) => {
      if (s.status !== 'CANCELLED') {
        const dur = getShiftDurationHours(s.startTime, s.endTime);
        totalHours += dur;
        totalBilling += dur * (Number(s.clientBillingRateHour) || 0);
        totalWages += dur * (Number(s.guardPayRateHour) || 0);
      }
    });

    const totalMargin = totalBilling - totalWages;
    const marginPct = totalBilling > 0 ? ((totalMargin / totalBilling) * 100).toFixed(1) : '0.0';

    return {
      totalCount,
      confirmedCount,
      totalHours: Number(totalHours.toFixed(1)),
      totalBilling: Number(totalBilling.toFixed(2)),
      totalWages: Number(totalWages.toFixed(2)),
      totalMargin: Number(totalMargin.toFixed(2)),
      marginPct,
    };
  }, [shifts]);

  const selectedSiteObj = useMemo(() => {
    return sites.find((s) => s.id === formSiteId);
  }, [sites, formSiteId]);

  const selectedGuardObj = useMemo(() => {
    return eligibleGuards.find((g) => g.id === formGuardId);
  }, [eligibleGuards, formGuardId]);

  const isOvernight = useMemo(() => {
    if (!formStartTime || !formEndTime) return false;
    return formEndTime <= formStartTime;
  }, [formStartTime, formEndTime]);

  const estimatedDurationHours = useMemo(() => {
    if (!formDate || !formStartTime || !formEndTime) return 0;
    const s = new Date(`${formDate}T${formStartTime}:00`).getTime();
    let e = new Date(`${formDate}T${formEndTime}:00`).getTime();
    if (e <= s) {
      e += 24 * 60 * 60 * 1000;
    }
    return Math.max(0, (e - s) / (1000 * 60 * 60));
  }, [formDate, formStartTime, formEndTime]);

  const activePayRate = useMemo(() => {
    if (formGuardPayRate !== '') return parseFloat(formGuardPayRate) || 0;
    if (selectedGuardObj) return Number(selectedGuardObj.payRatePerHour) || 0;
    return 0;
  }, [formGuardPayRate, selectedGuardObj]);

  const activeBillingRate = useMemo(() => {
    if (formClientBillingRate !== '') return parseFloat(formClientBillingRate) || 0;
    if (pricingSuggestion) return pricingSuggestion.suggestedClientBillingRate || 0;
    if (selectedSiteObj && Number(selectedSiteObj.billingRateHour) > 0) return Number(selectedSiteObj.billingRateHour);
    if (selectedSiteObj?.client && Number(selectedSiteObj.client.billingRateHour) > 0) return Number(selectedSiteObj.client.billingRateHour);
    return 0;
  }, [formClientBillingRate, pricingSuggestion, selectedSiteObj]);

  const modalWageTotal = useMemo(() => {
    return activePayRate * estimatedDurationHours;
  }, [activePayRate, estimatedDurationHours]);

  const modalBillingTotal = useMemo(() => {
    return activeBillingRate * estimatedDurationHours;
  }, [activeBillingRate, estimatedDurationHours]);

  const modalMargin = useMemo(() => {
    return modalBillingTotal - modalWageTotal;
  }, [modalBillingTotal, modalWageTotal]);

  const modalMarginPct = useMemo(() => {
    return modalBillingTotal > 0 ? ((modalMargin / modalBillingTotal) * 100).toFixed(1) : '0.0';
  }, [modalBillingTotal, modalMargin]);

  return (
    <div className="w-full flex flex-col gap-6 font-jakarta antialiased">
      {/* Top Header Card */}
      <div className="w-full bg-white border-2 border-black rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Operations Control • Dispatch
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#032031]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#032031]">
              Rota Scheduling
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Shift & Rota Management</h1>
          <p className="text-xs font-semibold text-black/70">
            Configure weekly property deployments, prevent overlapping shifts, and ensure SIA compliance locks.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-3 bg-slate-50 border-2 border-black/10 rounded-xl px-4 py-2 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Rostered</span>
              <span className="text-sm font-black text-black">{weekStats.totalCount} shifts</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Total Hours</span>
              <span className="text-sm font-black text-black">{weekStats.totalHours}h</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-wider text-blue-700">Est. Billing</span>
              <span className="text-sm font-black text-blue-950">£{weekStats.totalBilling.toLocaleString('en-GB')}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Est. Wages</span>
              <span className="text-sm font-black text-slate-900">£{weekStats.totalWages.toLocaleString('en-GB')}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-700">Gross Margin</span>
              <span className="text-sm font-black text-emerald-800">
                £{weekStats.totalMargin.toLocaleString('en-GB')} ({weekStats.marginPct}%)
              </span>
            </div>
          </div>

          {canWriteShifts && (
            <button
              onClick={() => handleOpenCreateModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#032031] text-white text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-black transition shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Shift
            </button>
          )}
        </div>
      </div>

      {/* Rota Controls Toolbar */}
      <div className="w-full bg-white border-2 border-black rounded-xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">View By:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('BY_SITE')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${
                viewMode === 'BY_SITE'
                  ? 'bg-white text-black shadow-xs border border-black/10'
                  : 'text-slate-500 hover:text-black'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Client Sites
            </button>
            <button
              onClick={() => setViewMode('BY_GUARD')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${
                viewMode === 'BY_GUARD'
                  ? 'bg-white text-black shadow-xs border border-black/10'
                  : 'text-slate-500 hover:text-black'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Guards
            </button>
          </div>
        </div>

        {/* Center: Week Navigator */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 border-2 border-black rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleCurrentWeek}
            className="px-3 py-1.5 border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
          >
            Current Week
          </button>

          <button
            onClick={handleNextWeek}
            className="p-2 border-2 border-black rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-black text-black ml-2">{weekRangeLabel}</span>
        </div>

        {/* Right: Filters & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={viewMode === 'BY_SITE' ? 'Filter properties...' : 'Filter officers...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-semibold border-2 border-black/20 rounded-lg focus:border-black focus:outline-none w-44"
            />
          </div>

          {viewMode === 'BY_SITE' && (
            <select
              value={filterSiteId}
              onChange={(e) => setFilterSiteId(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none"
            >
              <option value="ALL">All Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={() => fetchData(true)}
            className="p-2 border-2 border-black rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Rota"
          >
            <RotateCw className={`w-3.5 h-3.5 text-black ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Rota Matrix Grid */}
      <div className="w-full bg-white border-2 border-black rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <LoaderRectangle />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Loading deployment roster...
            </span>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[950px]">
              {/* Table Header: Days of the Week */}
              <thead>
                <tr className="border-b-2 border-black bg-slate-50">
                  <th className="p-3.5 w-60 border-r-2 border-black text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {viewMode === 'BY_SITE' ? 'Contracted Property' : 'Security Officer'}
                  </th>
                  {weekDays.map((d, index) => {
                    const isToday = new Date().toDateString() === d.toDateString();
                    return (
                      <th
                        key={index}
                        className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                          isToday ? 'bg-amber-50/60 font-black' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-amber-800' : 'text-slate-500'}`}>
                            {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                          </span>
                          <span className={`text-xs font-black ${isToday ? 'text-amber-900 font-extrabold' : 'text-black'}`}>
                            {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200">
                {viewMode === 'BY_SITE' ? (
                  filteredSites.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-xs font-bold text-slate-400">
                        No client sites found matching the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSites.map((site) => (
                      <tr key={site.id} className="hover:bg-slate-50/40 transition">
                        {/* Site Header Cell */}
                        <td className="p-3.5 border-r-2 border-black bg-white align-top">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-black text-black leading-tight">{site.name}</span>
                            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]">
                              {site.client.companyName}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 line-clamp-1">{site.address}</span>
                          </div>
                        </td>

                        {/* 7 Days Cells */}
                        {weekDays.map((d, i) => {
                          const cellShifts = getShiftsForCell(d, site.id, 'BY_SITE');
                          const isToday = new Date().toDateString() === d.toDateString();

                          return (
                            <td
                              key={i}
                              className={`p-2 border-r border-slate-200 last:border-r-0 align-top h-28 relative group ${
                                isToday ? 'bg-amber-50/20' : ''
                              }`}
                            >
                              <div className="flex flex-col gap-1.5 h-full">
                                {cellShifts.map((shift) => (
                                  <div
                                    key={shift.id}
                                    onClick={() => setSelectedShiftForDetails(shift)}
                                    className={`p-2 rounded-lg border text-left cursor-pointer transition shadow-2xs hover:shadow-xs flex flex-col gap-1 ${
                                      shift.status === 'CANCELLED'
                                        ? 'bg-slate-100 border-slate-300 opacity-60'
                                        : shift.status === 'CONFIRMED'
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                        : shift.status === 'CHECKED_IN'
                                        ? 'bg-blue-50 border-blue-400 text-blue-950 ring-1 ring-blue-300'
                                        : 'bg-white border-slate-300 text-slate-900'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                        {formatTimeRange(shift.startTime, shift.endTime)}
                                      </span>
                                      <span
                                        className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
                                          shift.status === 'CONFIRMED'
                                            ? 'bg-emerald-200 text-emerald-900'
                                            : shift.status === 'CHECKED_IN'
                                            ? 'bg-blue-200 text-blue-900'
                                            : shift.status === 'CANCELLED'
                                            ? 'bg-slate-200 text-slate-700'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {shift.status === 'SCHEDULED' ? 'Scheduled' : shift.status}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="text-[11px] font-bold text-black truncate">
                                          {shift.guard?.firstName} {shift.guard?.lastName}
                                        </span>
                                      </div>
                                      <span className="text-[8px] font-black font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 shrink-0">
                                        £{Number(shift.guardPayRateHour || 0).toFixed(0)}/h
                                      </span>
                                    </div>
                                  </div>
                                ))}

                                {/* Quick Add Button in Cell on Hover */}
                                {canWriteShifts && (
                                  <button
                                    onClick={() => handleOpenCreateModal(site.id, undefined, d)}
                                    className="opacity-0 group-hover:opacity-100 mt-auto w-full py-1 border border-dashed border-slate-300 hover:border-black rounded text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-black transition flex items-center justify-center gap-1 bg-white/80"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    Assign
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )
                ) : (
                  /* BY_GUARD VIEW */
                  filteredGuards.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-xs font-bold text-slate-400">
                        No active security officers found matching the current search.
                      </td>
                    </tr>
                  ) : (
                    filteredGuards.map((guard) => (
                      <tr key={guard.id} className="hover:bg-slate-50/40 transition">
                        {/* Guard Header Cell */}
                        <td className="p-3.5 border-r-2 border-black bg-white align-top">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-black text-black leading-tight">
                              {guard.firstName} {guard.lastName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="text-[9px] font-bold text-slate-500 truncate">
                                SIA: {guard.siaLicenceNumber || 'Verified'}
                              </span>
                            </div>
                            <span className="text-[9px] font-black text-slate-400">
                              Rate: £{Number(guard.payRatePerHour).toFixed(2)}/hr
                            </span>
                          </div>
                        </td>

                        {/* 7 Days Cells */}
                        {weekDays.map((d, i) => {
                          const cellShifts = getShiftsForCell(d, guard.id, 'BY_GUARD');
                          const isToday = new Date().toDateString() === d.toDateString();

                          return (
                            <td
                              key={i}
                              className={`p-2 border-r border-slate-200 last:border-r-0 align-top h-28 relative group ${
                                isToday ? 'bg-amber-50/20' : ''
                              }`}
                            >
                              <div className="flex flex-col gap-1.5 h-full">
                                {cellShifts.map((shift) => (
                                  <div
                                    key={shift.id}
                                    onClick={() => setSelectedShiftForDetails(shift)}
                                    className={`p-2 rounded-lg border text-left cursor-pointer transition shadow-2xs hover:shadow-xs flex flex-col gap-1 ${
                                      shift.status === 'CANCELLED'
                                        ? 'bg-slate-100 border-slate-300 opacity-60'
                                        : shift.status === 'CONFIRMED'
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                        : shift.status === 'CHECKED_IN'
                                        ? 'bg-blue-50 border-blue-400 text-blue-950 ring-1 ring-blue-300'
                                        : 'bg-white border-slate-300 text-slate-900'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                        {formatTimeRange(shift.startTime, shift.endTime)}
                                      </span>
                                      <span
                                        className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
                                          shift.status === 'CONFIRMED'
                                            ? 'bg-emerald-200 text-emerald-900'
                                            : shift.status === 'CHECKED_IN'
                                            ? 'bg-blue-200 text-blue-900'
                                            : shift.status === 'CANCELLED'
                                            ? 'bg-slate-200 text-slate-700'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {shift.status === 'SCHEDULED' ? 'Scheduled' : shift.status}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="text-[11px] font-bold text-black truncate">
                                          {shift.site?.name}
                                        </span>
                                      </div>
                                      <span className="text-[8px] font-black font-mono text-blue-900 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 shrink-0">
                                        £{Number(shift.clientBillingRateHour || 0).toFixed(0)}/h
                                      </span>
                                    </div>
                                  </div>
                                ))}

                                {canWriteShifts && (
                                  <button
                                    onClick={() => handleOpenCreateModal(undefined, guard.id, d)}
                                    className="opacity-0 group-hover:opacity-100 mt-auto w-full py-1 border border-dashed border-slate-300 hover:border-black rounded text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-black transition flex items-center justify-center gap-1 bg-white/80"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    Schedule
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Schedule Shift Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#032031]" />
                <h2 className="text-base font-black text-black uppercase tracking-wider">
                  Schedule Officer Deployment
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 border border-black/20 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateShift} className="flex flex-col gap-4">
              {/* Site Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                  Select Target Property *
                </label>
                <select
                  value={formSiteId}
                  onChange={(e) => setFormSiteId(e.target.value)}
                  className="px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:outline-none"
                  required
                >
                  <option value="" disabled>
                    -- Choose Property --
                  </option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.client.companyName})
                    </option>
                  ))}
                </select>
                {selectedSiteObj && (
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Address: {selectedSiteObj.address} • Geofence: {selectedSiteObj.geofenceRadiusMeters}m
                  </span>
                )}
              </div>

              {/* Timing Grid: Date, Start Time, End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Shift Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Guard Selection with Real-Time Compliance Audit */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Assign Compliant Officer *
                  </label>
                  {loadingGuards && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 animate-pulse">
                      Auditing officer licences & overlaps...
                    </span>
                  )}
                </div>

                <select
                  value={formGuardId}
                  onChange={(e) => handleGuardChange(e.target.value)}
                  className="px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:outline-none"
                  required
                >
                  <option value="" disabled>
                    -- Select Available Officer --
                  </option>
                  {eligibleGuards.map((g) => (
                    <option key={g.id} value={g.id} disabled={!g.isEligible}>
                      {g.isEligible ? '🟢' : '🔴'} {g.name} — £{Number(g.payRatePerHour).toFixed(2)}/hr
                      {!g.isEligible ? ` (${g.ineligibilityReason})` : ''}
                    </option>
                  ))}
                </select>

                {/* Selected Guard Details or Reason */}
                {selectedGuardObj && (
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-black">{selectedGuardObj.name}</span>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        SIA Licence Valid
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      SIA Number: {selectedGuardObj.siaLicenceNumber || 'N/A'} • Hourly Pay Rate: £{Number(selectedGuardObj.payRatePerHour).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Travel warning alert banner if tight travel between sites */}
                {travelWarning && (
                  <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-lg flex items-start gap-2.5 text-amber-900 mt-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                        Consecutive Travel Warning (BRD §4.1)
                      </span>
                      <span className="text-[10px] font-semibold text-amber-900 leading-relaxed">
                        {travelWarning}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Rate Snapshots & Overrides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                      Officer Pay Rate (£/hr)
                    </label>
                    {selectedGuardObj?.hasSiteSpecificRate && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        Site Rate Active
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="Auto-resolved pay rate"
                    value={formGuardPayRate}
                    onChange={(e) => setFormGuardPayRate(e.target.value)}
                    className="px-3 py-1.5 text-xs font-black border border-slate-300 rounded-lg focus:outline-none focus:border-black bg-white"
                  />
                  <span className="text-[9px] text-slate-400 font-semibold">
                    {selectedGuardObj?.hasSiteSpecificRate
                      ? `Agreed site rate (Base: £${Number(selectedGuardObj.basePayRatePerHour || 0).toFixed(2)}/hr)`
                      : 'Standard officer hourly wage'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                      Client Charge Rate (£/hr)
                    </label>
                    {pricingSuggestion && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">
                        {pricingSuggestion.rateTier.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="Auto-resolved client rate"
                    value={formClientBillingRate}
                    onChange={(e) => setFormClientBillingRate(e.target.value)}
                    className="px-3 py-1.5 text-xs font-black border border-slate-300 rounded-lg focus:outline-none focus:border-black bg-white"
                  />
                  <span className="text-[9px] text-slate-400 font-semibold">
                    {pricingSuggestion?.isWeekend
                      ? 'Weekend pricing rule applied'
                      : pricingSuggestion?.isNightShift
                      ? 'Night shift pricing rule applied'
                      : 'Contracted client billing rate'}
                  </span>
                </div>
              </div>

              {/* Commercials & Snapshot Summary */}
              <div className="p-4 bg-white border-2 border-black rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-black shadow-2xs">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Duration</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-black">{estimatedDurationHours.toFixed(1)} hrs</span>
                    {isOvernight && (
                      <span className="text-[8px] font-black uppercase bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                        Overnight
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Officer Wages</span>
                  <span className="text-xs font-black text-slate-900">
                    £{modalWageTotal.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    @ £{activePayRate.toFixed(2)}/hr
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Client Billed</span>
                  <span className="text-xs font-black text-blue-950">
                    £{modalBillingTotal.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    @ £{activeBillingRate.toFixed(2)}/hr
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Gross Margin</span>
                  <span className={`text-xs font-black ${modalMargin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    £{modalMargin.toFixed(2)} ({modalMarginPct}%)
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    Projected return
                  </span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black border-2 border-black rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formGuardId || !formSiteId}
                  className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-[#032031] hover:bg-black rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Scheduling Shift...' : 'Confirm & Schedule Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Shift Details & Cancellation Modal */}
      {selectedShiftForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#032031]" />
                <div className="flex flex-col">
                  <h2 className="text-base font-black text-black uppercase tracking-wider">
                    Shift Deployment Record
                  </h2>
                  <span className="text-[9px] font-bold text-slate-500">
                    ID: {selectedShiftForDetails.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedShiftForDetails(null)}
                className="p-1 border border-black/20 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Content Breakdown */}
            <div className="flex flex-col gap-4 text-xs font-semibold">
              {/* Site Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Target Property</span>
                <span className="text-sm font-black text-black">{selectedShiftForDetails.site?.name}</span>
                <span className="text-slate-600 text-[11px]">{selectedShiftForDetails.site?.address}</span>
                <span className="text-slate-500 text-[10px]">
                  Client: {selectedShiftForDetails.site?.client?.companyName} • Geofence: {selectedShiftForDetails.site?.geofenceRadiusMeters}m
                </span>
              </div>

              {/* Guard Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Assigned Officer</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-black">
                    {selectedShiftForDetails.guard?.firstName} {selectedShiftForDetails.guard?.lastName}
                  </span>
                  <span
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      selectedShiftForDetails.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedShiftForDetails.status === 'CHECKED_IN'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedShiftForDetails.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedShiftForDetails.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  SIA Licence: {selectedShiftForDetails.guard?.siaLicenceNumber || 'Verified on file'}
                </span>
              </div>

              {/* Shift Timing & Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Scheduled Time</span>
                  <span className="text-xs font-black text-black">
                    {new Date(selectedShiftForDetails.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {formatTimeRange(selectedShiftForDetails.startTime, selectedShiftForDetails.endTime)}
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Snapshotted Rates</span>
                  <span className="text-xs font-bold text-black">
                    Pay: £{Number(selectedShiftForDetails.guardPayRateHour).toFixed(2)}/hr
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    Billing: £{Number(selectedShiftForDetails.clientBillingRateHour).toFixed(2)}/hr
                  </span>
                </div>
              </div>

              {/* Shift Economics Summary */}
              {(() => {
                const shiftDuration = getShiftDurationHours(
                  selectedShiftForDetails.startTime,
                  selectedShiftForDetails.endTime
                );
                const payRate = Number(selectedShiftForDetails.guardPayRateHour) || 0;
                const billRate = Number(selectedShiftForDetails.clientBillingRateHour) || 0;
                const shiftWages = shiftDuration * payRate;
                const shiftCharges = shiftDuration * billRate;
                const shiftDiff = shiftCharges - shiftWages;
                const shiftMargin = shiftCharges > 0 ? ((shiftDiff / shiftCharges) * 100).toFixed(1) : '0.0';

                return (
                  <div className="p-3 bg-white border-2 border-black/10 rounded-xl grid grid-cols-3 gap-2 text-center shadow-2xs">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                        Shift Wages ({shiftDuration.toFixed(1)}h)
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        £{shiftWages.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                        Client Billed
                      </span>
                      <span className="text-xs font-black text-blue-950">
                        £{shiftCharges.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                        Gross Margin
                      </span>
                      <span className={`text-xs font-black ${shiftDiff >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        £{shiftDiff.toFixed(2)} ({shiftMargin}%)
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Pre-Shift Confirmation Status */}
              <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Attendance Confirmation
                </span>
                {selectedShiftForDetails.preShiftConfirmedAt ? (
                  <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmed ({new Date(selectedShiftForDetails.preShiftConfirmedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Confirmation
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t-2 border-black/10 pt-3">
              {canDispatchShifts && selectedShiftForDetails.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={handleCancelShift}
                  disabled={isCancelling}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  {isCancelling ? 'Cancelling...' : 'Cancel Shift'}
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
