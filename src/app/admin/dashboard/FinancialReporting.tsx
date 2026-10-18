'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService, FinancialReportData, AdminSite, ClientManagementProfile, GuardProfile } from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Coins, 
  TrendingUp, 
  Building2, 
  Users, 
  Calendar, 
  RotateCw, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  Receipt,
  ArrowUpRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export const FinancialReporting: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);

  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Entities for filter dropdowns
  const [clients, setClients] = useState<ClientManagementProfile[]>([]);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [guards, setGuards] = useState<GuardProfile[]>([]);

  // Filter states
  const [startDate, setStartDate] = useState(() => {
    // Default to start of current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedClientId, setSelectedClientId] = useState('ALL');
  const [selectedSiteId, setSelectedSiteId] = useState('ALL');
  const [selectedGuardId, setSelectedGuardId] = useState('ALL');

  // Active view tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BY_CLIENT' | 'BY_SITE' | 'BY_GUARD' | 'SHIFTS'>('OVERVIEW');
  const [shiftSearchQuery, setShiftSearchQuery] = useState('');

  // Initial load of clients, sites, and guards for filtering
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [clientsRes, sitesRes, guardsRes] = await Promise.all([
          adminService.getClients(),
          adminService.getAllSites(),
          adminService.getGuards(),
        ]);
        setClients(clientsRes.clients || []);
        setSites(sitesRes.sites || []);
        setGuards(guardsRes.guards || []);
      } catch (e) {
        console.error('Failed to load filter entities', e);
      }
    };
    fetchEntities();
  }, []);

  const loadReport = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await adminService.getFinancialReport({
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined,
        clientId: selectedClientId !== 'ALL' ? selectedClientId : undefined,
        siteId: selectedSiteId !== 'ALL' ? selectedSiteId : undefined,
        guardId: selectedGuardId !== 'ALL' ? selectedGuardId : undefined,
      });
      setReportData(res);
    } catch (err: any) {
      console.error('Error fetching financial report:', err);
      addToast(err.message || 'Failed to generate financial report', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [startDate, endDate, selectedClientId, selectedSiteId, selectedGuardId, addToast]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Quick Date Range Presets
  const handleQuickPreset = (preset: 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_WEEK' | 'ALL_TIME') => {
    const now = new Date();
    if (preset === 'THIS_MONTH') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'LAST_MONTH') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstDayLastMonth.toISOString().slice(0, 10));
      setEndDate(lastDayLastMonth.toISOString().slice(0, 10));
    } else if (preset === 'THIS_WEEK') {
      const day = now.getDay() || 7; // Monday = 1
      const monday = new Date(now);
      monday.setDate(now.getDate() - day + 1);
      setStartDate(monday.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'ALL_TIME') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!reportData || !reportData.shifts || reportData.shifts.length === 0) {
      addToast('No financial records to export.', 'info');
      return;
    }

    const headers = [
      'Shift ID',
      'Site Name',
      'Client Name',
      'Officer Name',
      'Start Time',
      'End Time',
      'Status',
      'Billable Hours',
      'Client Rate (£/hr)',
      'Guard Pay Rate (£/hr)',
      'Est. Client Charge (£)',
      'Est. Guard Wage (£)',
      'Est. Gross Margin (£)',
    ];

    const rows = reportData.shifts.map((s) => [
      s.shiftId,
      `"${s.siteName.replace(/"/g, '""')}"`,
      `"${s.clientName.replace(/"/g, '""')}"`,
      `"${s.guardName.replace(/"/g, '""')}"`,
      new Date(s.startTime).toLocaleString('en-GB'),
      new Date(s.endTime).toLocaleString('en-GB'),
      s.status,
      s.billableHours.toFixed(2),
      s.clientBillingRateHour.toFixed(2),
      s.guardPayRateHour.toFixed(2),
      s.estimatedCharge.toFixed(2),
      s.estimatedWage.toFixed(2),
      s.estimatedDifference.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fortress_Financial_Report_${startDate || 'all'}_to_${endDate || 'all'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Financial report exported to CSV successfully.', 'success');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Filtered shifts for table
  const filteredShifts = useMemo(() => {
    if (!reportData?.shifts) return [];
    if (!shiftSearchQuery.trim()) return reportData.shifts;
    const query = shiftSearchQuery.toLowerCase();
    return reportData.shifts.filter(
      (s) =>
        s.siteName.toLowerCase().includes(query) ||
        s.clientName.toLowerCase().includes(query) ||
        s.guardName.toLowerCase().includes(query) ||
        s.shiftId.toLowerCase().includes(query)
    );
  }, [reportData?.shifts, shiftSearchQuery]);

  const summary = reportData?.summary;

  return (
    <div className="w-full flex flex-col gap-6 font-jakarta antialiased text-black">
      
      {/* 1. Header Banner */}
      <div className="w-full bg-white border border-black rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Operations Intelligence • Internal Management
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              Currency: £ GBP
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Estimated Financial & Operational Reporting</h1>
          <p className="text-xs font-semibold text-black/70 max-w-2xl">
            Internal financial performance models comparing agreed client billing charge rates against security officer wages across sites and rostered shifts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadReport(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 border border-black rounded-lg text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 text-black ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            Print
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#032031] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Internal Disclaimer Notice */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-300/80 rounded-xl flex items-start gap-3 text-amber-950 text-xs shadow-2xs">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-[11px] uppercase tracking-wider text-amber-900">
            Internal Management Forecast Notice
          </span>
          <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
            Values shown represent internal estimates based on scheduled or recorded working hours multiplied by contractual charge rates and guard wages. The difference between client charges and wages is an estimated gross operational margin and does <strong>not</strong> represent net profit. Overhead costs, employer contributions, holiday accruals, insurance, and administrative fees are accounted for separately.
          </p>
        </div>
      </div>

      {/* 2. Filter Controls Card */}
      <div className="w-full bg-white border border-black rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#032031]" />
            Report Parameters & Scope
          </span>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleQuickPreset('THIS_WEEK')}
              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              This Week
            </button>
            <button
              onClick={() => handleQuickPreset('THIS_MONTH')}
              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              This Month
            </button>
            <button
              onClick={() => handleQuickPreset('LAST_MONTH')}
              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Last Month
            </button>
            <button
              onClick={() => handleQuickPreset('ALL_TIME')}
              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              All Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 px-3 border border-slate-300 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-[#032031]"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 px-3 border border-slate-300 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-[#032031]"
            />
          </div>

          {/* Client Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="h-9 px-2.5 border border-slate-300 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-[#032031]"
            >
              <option value="ALL">All Clients ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Site Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              Property / Site
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="h-9 px-2.5 border border-slate-300 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-[#032031]"
            >
              <option value="ALL">All Sites ({sites.length})</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Guard Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              Security Officer
            </label>
            <select
              value={selectedGuardId}
              onChange={(e) => setSelectedGuardId(e.target.value)}
              className="h-9 px-2.5 border border-slate-300 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-[#032031]"
            >
              <option value="ALL">All Officers ({guards.length})</option>
              {guards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.firstName} {g.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. High-Level Summary KPI Cards */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Aggregating financial reports...
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Estimated Client Charges */}
            <div className="bg-white border border-black rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Estimated Client Charges
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#032031]">
                  £{summary?.totalEstimatedCharges.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Across {summary?.totalScheduledHours || 0} billable hrs
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center shadow-2xs shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Estimated Guard Wages */}
            <div className="bg-white border border-black rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Estimated Guard Wages
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#032031]">
                  £{summary?.totalEstimatedWages.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Payroll payable forecast
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shadow-2xs shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Estimated Difference / Gross Margin */}
            <div className="bg-white border border-black rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Est. Difference / Gross Margin
                </span>
                <span className={`text-2xl sm:text-3xl font-black ${(summary?.totalEstimatedDifference || 0) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  £{summary?.totalEstimatedDifference.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {summary && summary.totalEstimatedCharges > 0
                    ? `${((summary.totalEstimatedDifference / summary.totalEstimatedCharges) * 100).toFixed(1)}% margin`
                    : '0% margin'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shadow-2xs shrink-0">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Operating Shifts & Recorded Hours */}
            <div className="bg-white border border-black rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Rostered Deployments
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#032031]">
                  {summary?.totalShifts || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {summary?.totalCompletedShifts || 0} completed • {summary?.totalRecordedHours || 0} recorded hrs
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#032031] border border-slate-300 flex items-center justify-center shadow-2xs shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Precision Analytics Breakdown Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800">
                  Realized Billed (Clocked)
                </span>
                <span className="text-base font-black text-emerald-950">
                  £{summary?.totalCompletedCharges?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[9px] font-bold text-emerald-700">
                  {summary?.totalCompletedHours || 0} verified on-site hrs
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-800">
                  Rota Forecast (Upcoming)
                </span>
                <span className="text-base font-black text-blue-950">
                  £{summary?.totalForecastUpcomingCharges?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[9px] font-bold text-blue-700">
                  {summary?.totalScheduledUpcomingShifts || 0} scheduled roster shifts
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded">
                Forecast
              </span>
            </div>

            <div className={`rounded-xl p-3.5 flex items-center justify-between border ${
              (summary?.totalMissedShifts || 0) > 0
                ? 'bg-red-50/80 border-red-200 text-red-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-red-800">
                  Unfulfilled / Missed SLA
                </span>
                <span className="text-base font-black text-red-950">
                  {summary?.totalMissedShifts || 0} shifts ({summary?.totalMissedHours || 0} hrs)
                </span>
                <span className="text-[9px] font-bold text-red-700">
                  £{summary?.totalMissedRevenueImpact?.toFixed(2) || '0.00'} unbilled revenue impact
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                (summary?.totalMissedShifts || 0) > 0
                  ? 'bg-red-200 text-red-900'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {(summary?.totalMissedShifts || 0) > 0 ? 'Action Req' : 'Clear SLA'}
              </span>
            </div>
          </div>

          {/* 4. Tab Navigation Bar */}
          <div className="w-full bg-white border border-black rounded-xl overflow-hidden shadow-xs">
            
            <div className="p-4 border-b border-black/10 flex items-center justify-between flex-wrap gap-3 bg-zinc-50/70">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'OVERVIEW', label: 'Summary Overview' },
                  { id: 'BY_CLIENT', label: `By Client (${reportData?.byClient.length || 0})` },
                  { id: 'BY_SITE', label: `By Site (${reportData?.bySite.length || 0})` },
                  { id: 'BY_GUARD', label: `By Officer (${reportData?.byGuard.length || 0})` },
                  { id: 'SHIFTS', label: `Detailed Shift Ledger (${reportData?.shifts.length || 0})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-[#032031] text-white shadow-xs'
                        : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === 'SHIFTS' && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-black/40" />
                  <input
                    type="text"
                    value={shiftSearchQuery}
                    onChange={(e) => setShiftSearchQuery(e.target.value)}
                    placeholder="Search shift ledger..."
                    className="h-8 pl-8 pr-3 w-full border border-black/20 rounded-lg text-xs bg-white focus:outline-none focus:border-black font-semibold"
                  />
                </div>
              )}
            </div>

            {/* TAB CONTENT */}

            {/* 1. OVERVIEW TAB */}
            {activeTab === 'OVERVIEW' && (
              <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Top Clients by Volume */}
                  <div className="p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#032031]" />
                        Top Client Portfolios
                      </span>
                      <span>Est. Difference</span>
                    </span>

                    {reportData?.byClient.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No client billing records found.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {reportData?.byClient.slice(0, 5).map((c) => (
                          <div key={c.clientId} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#032031]">{c.clientName}</span>
                              <span className="text-[10px] text-slate-500">{c.totalHours} hrs • {c.shiftCount} shifts</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-emerald-700">£{c.estimatedDifference.toFixed(2)}</span>
                              <span className="block text-[9px] text-slate-400">Bill: £{c.estimatedCharges.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top Sites by Volume */}
                  <div className="p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                        Top Security Sites
                      </span>
                      <span>Est. Difference</span>
                    </span>

                    {reportData?.bySite.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No site records found.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {reportData?.bySite.slice(0, 5).map((s) => (
                          <div key={s.siteId} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#032031]">{s.siteName}</span>
                              <span className="text-[10px] text-slate-500">{s.clientName} • {s.totalHours} hrs</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-emerald-700">£{s.estimatedDifference.toFixed(2)}</span>
                              <span className="block text-[9px] text-slate-400">Bill: £{s.estimatedCharges.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* 2. BY CLIENT TAB */}
            {activeTab === 'BY_CLIENT' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-black/10 bg-black/[0.02] text-[9px] font-black uppercase tracking-wider text-black/60">
                      <th className="py-3 px-4">Client Organization</th>
                      <th className="py-3 px-4 text-center">Shifts</th>
                      <th className="py-3 px-4 text-center">Total Hours</th>
                      <th className="py-3 px-4 text-right">Est. Charges (£)</th>
                      <th className="py-3 px-4 text-right">Est. Wages (£)</th>
                      <th className="py-3 px-4 text-right">Est. Difference (£)</th>
                      <th className="py-3 px-4 text-right">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-medium">
                    {reportData?.byClient.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">No client data for selected period.</td>
                      </tr>
                    ) : (
                      reportData?.byClient.map((c) => {
                        const marginPercent = c.estimatedCharges > 0 ? (c.estimatedDifference / c.estimatedCharges) * 100 : 0;
                        return (
                          <tr key={c.clientId} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-bold text-[#032031]">{c.clientName}</td>
                            <td className="py-3 px-4 text-center font-semibold">{c.shiftCount}</td>
                            <td className="py-3 px-4 text-center font-mono font-semibold">{c.totalHours.toFixed(1)} hrs</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900">£{c.estimatedCharges.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-700">£{c.estimatedWages.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-black text-emerald-700">£{c.estimatedDifference.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-black text-slate-900">{marginPercent.toFixed(1)}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. BY SITE TAB */}
            {activeTab === 'BY_SITE' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-black/10 bg-black/[0.02] text-[9px] font-black uppercase tracking-wider text-black/60">
                      <th className="py-3 px-4">Site / Facility</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4 text-center">Shifts</th>
                      <th className="py-3 px-4 text-center">Hours</th>
                      <th className="py-3 px-4 text-right">Est. Charges (£)</th>
                      <th className="py-3 px-4 text-right">Est. Wages (£)</th>
                      <th className="py-3 px-4 text-right">Est. Difference (£)</th>
                      <th className="py-3 px-4 text-right">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-medium">
                    {reportData?.bySite.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">No site data for selected period.</td>
                      </tr>
                    ) : (
                      reportData?.bySite.map((s) => {
                        const marginPercent = s.estimatedCharges > 0 ? (s.estimatedDifference / s.estimatedCharges) * 100 : 0;
                        return (
                          <tr key={s.siteId} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-bold text-[#032031]">{s.siteName}</td>
                            <td className="py-3 px-4 text-slate-600 font-semibold">{s.clientName}</td>
                            <td className="py-3 px-4 text-center font-semibold">{s.shiftCount}</td>
                            <td className="py-3 px-4 text-center font-mono font-semibold">{s.totalHours.toFixed(1)} hrs</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900">£{s.estimatedCharges.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-700">£{s.estimatedWages.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-black text-emerald-700">£{s.estimatedDifference.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-black text-slate-900">{marginPercent.toFixed(1)}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. BY GUARD TAB */}
            {activeTab === 'BY_GUARD' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-black/10 bg-black/[0.02] text-[9px] font-black uppercase tracking-wider text-black/60">
                      <th className="py-3 px-4">Security Officer</th>
                      <th className="py-3 px-4 text-center">Shifts Rostered</th>
                      <th className="py-3 px-4 text-center">Total Working Hours</th>
                      <th className="py-3 px-4 text-right">Avg Pay Rate (£/hr)</th>
                      <th className="py-3 px-4 text-right">Est. Total Wages (£)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-medium">
                    {reportData?.byGuard.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">No officer payroll data for selected period.</td>
                      </tr>
                    ) : (
                      reportData?.byGuard.map((g) => (
                        <tr key={g.guardId} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-bold text-[#032031]">{g.guardName}</td>
                          <td className="py-3 px-4 text-center font-semibold">{g.shiftCount}</td>
                          <td className="py-3 px-4 text-center font-mono font-semibold">{g.totalHours.toFixed(1)} hrs</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-700">£{g.averagePayRate.toFixed(2)}/hr</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700">£{g.estimatedWages.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. SHIFT-BY-SHIFT LEDGER TAB */}
            {activeTab === 'SHIFTS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-black/10 bg-black/[0.02] text-[9px] font-black uppercase tracking-wider text-black/60">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Site & Client</th>
                      <th className="py-3 px-4">Assigned Officer</th>
                      <th className="py-3 px-4 text-center">Hours</th>
                      <th className="py-3 px-4 text-right">Client Rate</th>
                      <th className="py-3 px-4 text-right">Guard Rate</th>
                      <th className="py-3 px-4 text-right">Est. Charge (£)</th>
                      <th className="py-3 px-4 text-right">Est. Wage (£)</th>
                      <th className="py-3 px-4 text-right">Difference (£)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-medium">
                    {filteredShifts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">No shift records found matching your filters.</td>
                      </tr>
                    ) : (
                      filteredShifts.map((s) => (
                        <tr key={s.shiftId} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#032031]">{new Date(s.startTime).toLocaleDateString('en-GB')}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#032031]">{s.siteName}</span>
                              <span className="text-[10px] text-slate-500">{s.clientName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{s.guardName}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-mono font-bold text-slate-900">{s.billableHours.toFixed(1)} hrs</span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${s.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                                {s.isCompleted ? 'Clocked' : 'Scheduled'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">£{s.clientBillingRateHour.toFixed(2)}/hr</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-600">£{s.guardPayRateHour.toFixed(2)}/hr</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">£{s.estimatedCharge.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-700">£{s.estimatedWage.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700">£{s.estimatedDifference.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
};

export default FinancialReporting;
