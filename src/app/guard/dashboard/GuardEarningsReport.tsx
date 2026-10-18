'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { guardService, GuardEarningsReportData } from '@/services/guard.service';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Coins, 
  Clock, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Download, 
  Printer, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  MapPin
} from 'lucide-react';

export const GuardEarningsReport: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);

  const [report, setReport] = useState<GuardEarningsReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'TIMESHEET' | 'BY_SITE'>('SUMMARY');

  const fetchEarnings = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await guardService.getEarningsReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        siteId: selectedSiteId !== 'ALL' ? selectedSiteId : undefined,
      });
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load guard earnings report:', err);
      addToast(err.message || 'Failed to retrieve earnings report', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [startDate, endDate, selectedSiteId, addToast]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleQuickPreset = (preset: 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'ALL_TIME') => {
    const now = new Date();
    if (preset === 'THIS_WEEK') {
      const day = now.getDay() || 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - day + 1);
      setStartDate(monday.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'THIS_MONTH') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'LAST_MONTH') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(first.toISOString().slice(0, 10));
      setEndDate(last.toISOString().slice(0, 10));
    } else if (preset === 'ALL_TIME') {
      setStartDate('');
      setEndDate('');
    }
  };

  // CSV Export for Guard Timesheet
  const handleExportCSV = () => {
    if (!report || report.timesheet.length === 0) {
      addToast('No timesheet records available to export', 'info');
      return;
    }

    const headers = [
      'Shift ID',
      'Site Name',
      'Site Address',
      'Start Time',
      'End Time',
      'Status',
      'Actual Hours',
      'Agreed Pay Rate (£/hr)',
      'Gross Pay (£)',
      'GPS Verified',
    ];

    const rows = report.timesheet.map((t) => [
      t.shiftId,
      `"${t.siteName.replace(/"/g, '""')}"`,
      `"${t.siteAddress.replace(/"/g, '""')}"`,
      new Date(t.startTime).toISOString(),
      new Date(t.endTime).toISOString(),
      t.status,
      t.actualWorkedHours.toFixed(2),
      t.payRateHour.toFixed(2),
      t.grossPay.toFixed(2),
      t.isGpsVerified ? 'YES' : 'NO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Officer_Timesheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Officer timesheet exported successfully', 'success');
  };

  const summary = report?.summary;

  return (
    <div className="w-full flex flex-col gap-6 font-jakarta antialiased animate-fade-in select-none">
      
      {/* 1. Header Banner */}
      <div className="w-full bg-white border-2 border-black rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Officer Portal • Financial Accounting
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              Wage & Hours Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-black">My Earnings & Timesheet</h1>
          <p className="text-xs font-semibold text-black/70">
            Transparent breakdown of verified on-site duty hours, agreed hourly wage rates, and rota earnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => fetchEarnings(true)}
            disabled={isRefreshing}
            className="p-2 border-2 border-black rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Ledger"
          >
            <RotateCw className={`w-3.5 h-3.5 text-black ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#032031] text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-black transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Timesheet CSV
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="w-full bg-white border-2 border-black rounded-xl p-4 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Accounting Period & Property Filter
          </span>

          <div className="flex items-center gap-1.5">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 px-3 border border-slate-300 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 px-3 border border-slate-300 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              Contracted Site
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="h-9 px-2.5 border border-slate-300 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-black"
            >
              <option value="ALL">All Contracted Sites</option>
              {report?.bySite.map((s) => (
                <option key={s.siteId} value={s.siteId}>
                  {s.siteName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white border-2 border-black rounded-xl">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Calculating earnings & verified hours...
          </span>
        </div>
      ) : (
        <>
          {/* 3. Core KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Earned Wages */}
            <div className="bg-white border-2 border-black rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Total Earned Gross Pay
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  £{summary?.totalEarnedWages.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {summary?.totalCompletedHours || 0} verified on-duty hrs
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Projected Upcoming Earnings */}
            <div className="bg-white border-2 border-black rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Projected Rota Pay
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#032031]">
                  £{summary?.projectedUpcomingWages.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {summary?.totalScheduledUpcomingHours || 0} upcoming rostered hrs
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Average Hourly Pay Rate */}
            <div className="bg-white border-2 border-black rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Effective Hourly Wage
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  £{summary?.averageHourlyPayRate.toFixed(2) || '0.00'}/hr
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Contractual hourly base
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Duty Shifts Completed */}
            <div className="bg-white border-2 border-black rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Completed Shifts
                </span>
                <span className="text-2xl sm:text-3xl font-black text-black">
                  {summary?.totalCompletedShifts || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {summary?.totalUpcomingShifts || 0} scheduled ahead
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#032031] border border-slate-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* 4. Tab Navigation Bar */}
          <div className="w-full bg-white border-2 border-black rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 border-b-2 border-black bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('TIMESHEET')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    activeTab === 'TIMESHEET'
                      ? 'bg-[#032031] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black hover:bg-slate-200'
                  }`}
                >
                  Timesheet Ledger ({report?.timesheet.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('BY_SITE')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    activeTab === 'BY_SITE'
                      ? 'bg-[#032031] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black hover:bg-slate-200'
                  }`}
                >
                  By Property ({report?.bySite.length || 0})
                </button>
              </div>

              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                All values in GBP (£)
              </span>
            </div>

            {/* TAB 1: DETAILED TIMESHEET TABLE */}
            {activeTab === 'TIMESHEET' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-[9px] font-black uppercase tracking-wider text-slate-600">
                      <th className="py-3 px-4">Shift Date & Hours</th>
                      <th className="py-3 px-4">Monitored Property</th>
                      <th className="py-3 px-4 text-center">Clock-In / Out</th>
                      <th className="py-3 px-4 text-center">Verified Hours</th>
                      <th className="py-3 px-4 text-right">Agreed Rate</th>
                      <th className="py-3 px-4 text-right">Gross Pay</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {report?.timesheet.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No timesheet records found for this period.
                        </td>
                      </tr>
                    ) : (
                      report?.timesheet.map((t) => (
                        <tr key={t.shiftId} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-black">
                                {new Date(t.startTime).toLocaleDateString('en-GB', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(t.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#032031]">{t.siteName}</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-xs">{t.siteAddress}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {t.checkInTime ? (
                              <div className="flex flex-col items-center">
                                <span className="font-mono text-[11px] font-bold text-emerald-700">
                                  In: {new Date(t.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {t.checkOutTime && (
                                  <span className="font-mono text-[10px] text-slate-500">
                                    Out: {new Date(t.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold uppercase">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-mono font-black text-black">
                                {t.isCompleted
                                  ? `${t.actualWorkedHours.toFixed(1)} hrs`
                                  : `${t.scheduledDurationHours.toFixed(1)} hrs`}
                              </span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                t.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {t.isCompleted ? 'Verified' : 'Forecast'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-black text-slate-800">
                            £{t.payRateHour.toFixed(2)}/hr
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <span className="font-black text-emerald-700 text-sm">
                              £{t.grossPay.toFixed(2)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              t.status === 'CHECKED_OUT'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : t.status === 'CHECKED_IN'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                                : t.status === 'MISSED'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: PROPERTY BREAKDOWN */}
            {activeTab === 'BY_SITE' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-[9px] font-black uppercase tracking-wider text-slate-600">
                      <th className="py-3 px-4">Property / Site</th>
                      <th className="py-3 px-4 text-center">Shifts Rostered</th>
                      <th className="py-3 px-4 text-center">Completed Hours</th>
                      <th className="py-3 px-4 text-right">Site Pay Rate (£/hr)</th>
                      <th className="py-3 px-4 text-right">Earned Pay (£)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {report?.bySite.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          No site records for this period.
                        </td>
                      </tr>
                    ) : (
                      report?.bySite.map((s) => (
                        <tr key={s.siteId} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-bold text-black">{s.siteName}</td>
                          <td className="py-3.5 px-4 text-center font-semibold">{s.shiftCount}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                            {s.completedHours.toFixed(1)} hrs
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-700">
                            £{s.payRate.toFixed(2)}/hr
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                            £{s.earnedWages.toFixed(2)}
                          </td>
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
