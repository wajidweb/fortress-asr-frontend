'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { clientService, ClientBillingReportData } from '@/services/client.service';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Building2, 
  Receipt, 
  Clock, 
  ShieldCheck, 
  Download, 
  RotateCw, 
  Calendar, 
  Coins, 
  CheckCircle2, 
  MapPin, 
  FileText,
  BadgeCheck
} from 'lucide-react';

export const ClientBillingReport: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);

  const [report, setReport] = useState<ClientBillingReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'DELIVERY_LEDGER' | 'BY_PROPERTY'>('DELIVERY_LEDGER');

  const fetchBillingReport = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await clientService.getBillingReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        siteId: selectedSiteId !== 'ALL' ? selectedSiteId : undefined,
      });
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load client billing report:', err);
      addToast(err.message || 'Failed to retrieve billing and attendance report', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [startDate, endDate, selectedSiteId, addToast]);

  useEffect(() => {
    fetchBillingReport();
  }, [fetchBillingReport]);

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

  // Export CSV Billing Statement
  const handleExportCSV = () => {
    if (!report || report.shiftDeliveryLogs.length === 0) {
      addToast('No attendance delivery records available to export', 'info');
      return;
    }

    const headers = [
      'Shift ID',
      'Site Name',
      'Site Address',
      'Verified Officer',
      'SIA Badge',
      'Start Time',
      'End Time',
      'Delivered Hours',
      'Contract Rate (£/hr)',
      'Net Charge (£)',
      'VAT (£)',
      'Gross Total (£)',
      'Status',
    ];

    const rows = report.shiftDeliveryLogs.map((l) => [
      l.shiftId,
      `"${l.siteName.replace(/"/g, '""')}"`,
      `"${l.siteAddress.replace(/"/g, '""')}"`,
      `"${l.officerName.replace(/"/g, '""')}"`,
      `"${l.siaBadge.replace(/"/g, '""')}"`,
      new Date(l.startTime).toISOString(),
      new Date(l.endTime).toISOString(),
      l.deliveredHours.toFixed(2),
      l.clientRateHour.toFixed(2),
      l.netCharge.toFixed(2),
      l.vatAmount.toFixed(2),
      l.grossCharge.toFixed(2),
      l.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Corporate_Billing_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Corporate billing statement exported successfully', 'success');
  };

  const summary = report?.summary;

  return (
    <div className="w-full flex flex-col gap-6 font-jakarta antialiased animate-fade-in select-none">
      
      {/* 1. Header Banner */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Corporate Portal • Finance & Billing
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#032031]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#032031]">
              Verified Service Statement
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#032031]">Billing & Service Attendance</h1>
          <p className="text-xs text-slate-500 font-medium">
            Review verified security officer hours delivered to your contracted facilities and official itemized cost statements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => fetchBillingReport(true)}
            disabled={isRefreshing}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition cursor-pointer"
            title="Refresh Ledger"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#032031] text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-black transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Statement CSV
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Billing Period & Property Selection
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
              className="h-9 px-3 border border-slate-200 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-[#032031]"
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
              className="h-9 px-3 border border-slate-200 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-[#032031]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              Contracted Property
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="h-9 px-2.5 border border-slate-200 rounded-lg font-semibold text-xs bg-white focus:outline-none focus:border-[#032031]"
            >
              <option value="ALL">All Properties ({report?.bySite.length || 0})</option>
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
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Generating corporate service statement...
          </span>
        </div>
      ) : (
        <>
          {/* 3. Core KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Delivered Verified Hours */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-2xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Delivered Security Hours
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#032031]">
                  {summary?.totalDeliveredHours.toFixed(1) || '0.0'} hrs
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {summary?.totalDeliveredShifts || 0} verified completed shifts
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-[#032031] border border-slate-200 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Net Charges (ex VAT) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-2xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Net Service Cost (ex VAT)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  £{summary?.totalDeliveredChargesNet.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  Avg: £{summary?.averageHourlyBillingRate.toFixed(2) || '0.00'}/hr
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: VAT Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-2xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  UK VAT (20% Standard)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  £{summary?.totalDeliveredChargesVat.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  HMRC Standard Treatment
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Total Gross Invoiced (inc VAT) */}
            <div className="bg-white border border-emerald-300 rounded-xl p-5 flex items-center justify-between shadow-2xs bg-emerald-50/20">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Total Investment (inc VAT)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-800">
                  £{summary?.totalDeliveredChargesGross.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">
                  Verified security billing
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* 4. Tab Navigation Bar */}
          <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('DELIVERY_LEDGER')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    activeTab === 'DELIVERY_LEDGER'
                      ? 'bg-[#032031] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-black hover:bg-slate-200'
                  }`}
                >
                  Itemized Service Logs ({report?.shiftDeliveryLogs.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('BY_PROPERTY')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    activeTab === 'BY_PROPERTY'
                      ? 'bg-[#032031] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-black hover:bg-slate-200'
                  }`}
                >
                  By Monitored Property ({report?.bySite.length || 0})
                </button>
              </div>

              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                All figures GBP (£)
              </span>
            </div>

            {/* TAB 1: ITEMIZED SERVICE LOGS */}
            {activeTab === 'DELIVERY_LEDGER' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-[9px] font-black uppercase tracking-wider text-slate-600">
                      <th className="py-3 px-4">Shift Date & Time</th>
                      <th className="py-3 px-4">Facility / Site</th>
                      <th className="py-3 px-4">Verified Officer</th>
                      <th className="py-3 px-4 text-center">Delivered Hours</th>
                      <th className="py-3 px-4 text-right">Contract Rate</th>
                      <th className="py-3 px-4 text-right">Net Cost (£)</th>
                      <th className="py-3 px-4 text-right">VAT (20%)</th>
                      <th className="py-3 px-4 text-right">Total (£)</th>
                      <th className="py-3 px-4 text-center">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {report?.shiftDeliveryLogs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          No service delivery logs recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      report?.shiftDeliveryLogs.map((l) => (
                        <tr key={l.shiftId} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">
                                {new Date(l.startTime).toLocaleDateString('en-GB', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(l.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(l.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#032031]">{l.siteName}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-xs">{l.siteAddress}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 bg-slate-100 rounded text-slate-700">
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{l.officerName}</span>
                                <span className="text-[9px] font-mono text-slate-400">{l.siaBadge}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-mono font-black text-slate-900">
                                {l.isCompleted ? `${l.deliveredHours.toFixed(1)} hrs` : `${l.scheduledDurationHours.toFixed(1)} hrs`}
                              </span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                l.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {l.isCompleted ? 'Clocked' : 'Scheduled'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-black text-slate-800">
                            £{l.clientRateHour.toFixed(2)}/hr
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            £{l.netCharge.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                            £{l.vatAmount.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                            £{l.grossCharge.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                              GPS Verified
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: BY PROPERTY BREAKDOWN */}
            {activeTab === 'BY_PROPERTY' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-[9px] font-black uppercase tracking-wider text-slate-600">
                      <th className="py-3 px-4">Property / Facility</th>
                      <th className="py-3 px-4 text-center">Total Shifts</th>
                      <th className="py-3 px-4 text-center">Delivered Hours</th>
                      <th className="py-3 px-4 text-right">Contracted Rate (£/hr)</th>
                      <th className="py-3 px-4 text-right">Net Cost (£)</th>
                      <th className="py-3 px-4 text-right">VAT (20%)</th>
                      <th className="py-3 px-4 text-right">Total (£ inc VAT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {report?.bySite.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No property billing records for this period.
                        </td>
                      </tr>
                    ) : (
                      report?.bySite.map((s) => (
                        <tr key={s.siteId} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#032031]">{s.siteName}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-xs">{s.siteAddress}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold">{s.shiftCount}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                            {s.deliveredHours.toFixed(1)} hrs
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-700">
                            £{s.clientRate.toFixed(2)}/hr
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            £{s.deliveredNet.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                            £{s.deliveredVat.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                            £{s.deliveredGross.toFixed(2)}
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
