'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminService, GuardSiteRate, AdminSite } from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore, hasPermission } from '@/store/useAuthStore';
import { 
  Coins, 
  Plus, 
  Trash2, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  X, 
  RotateCw,
  AlertCircle,
  FileText
} from 'lucide-react';

interface GuardSiteRatesSectionProps {
  guardId: string;
  guardName: string;
  baselineRate?: number | string | null;
}

export const GuardSiteRatesSection: React.FC<GuardSiteRatesSectionProps> = ({
  guardId,
  guardName,
  baselineRate,
}) => {
  const addToast = useUIStore((state) => state.addToast);
  const currentUser = useAuthStore((state) => state.user);
  const canEditRates = hasPermission(currentUser, 'guards:write');

  const [rates, setRates] = useState<GuardSiteRate[]>([]);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [payRateHour, setPayRateHour] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [ratesRes, sitesRes] = await Promise.all([
        adminService.getGuardSiteRates(guardId),
        adminService.getAllSites(),
      ]);
      setRates(ratesRes.rates || []);
      setSites(sitesRes.sites || []);
    } catch (err: any) {
      console.error('Error fetching guard site rates:', err);
      addToast(err.message || 'Failed to load site pay rates', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [guardId, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) {
      addToast('Please select a site', 'error');
      return;
    }
    if (!payRateHour || parseFloat(payRateHour) <= 0) {
      addToast('Please enter a valid hourly pay rate', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.createGuardSiteRate(guardId, {
        siteId: selectedSiteId,
        payRateHour: parseFloat(payRateHour),
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : new Date().toISOString(),
        effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null,
        notes: notes.trim() || null,
        isActive: true,
      });

      addToast('Site pay rate assigned successfully!', 'success');
      setSelectedSiteId('');
      setPayRateHour('');
      setEffectiveTo('');
      setNotes('');
      setShowAddForm(false);
      loadData(true);
    } catch (err: any) {
      console.error('Error creating site pay rate:', err);
      addToast(err.message || 'Failed to assign site pay rate', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRate = async (rateId: string, siteName: string) => {
    if (!confirm(`Are you sure you want to remove the special site pay rate for "${siteName}"? The officer will revert to their baseline pay rate.`)) {
      return;
    }

    try {
      await adminService.deleteGuardSiteRate(guardId, rateId);
      addToast('Site pay rate removed', 'success');
      setRates((prev) => prev.filter((r) => r.id !== rateId));
    } catch (err: any) {
      addToast(err.message || 'Failed to remove site pay rate', 'error');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 font-jakarta text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
              Site-Specific Pay Rates (£ GBP)
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">
              Assignment-specific hourly wages for {guardName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Refresh rates"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {canEditRates && (
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#032031] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Assign Site Rate'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Baseline Rate Notice */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Default Baseline Wage:</span>
          <span className="font-black text-[#032031] text-sm">
            {baselineRate ? `£${Number(baselineRate).toFixed(2)}/hr` : '£0.00/hr'}
          </span>
        </div>
        <span className="text-[10px] text-slate-500">
          Applies automatically unless overridden below.
        </span>
      </div>

      {/* Add Form Box */}
      {showAddForm && (
        <form
          onSubmit={handleCreateRate}
          className="p-4 bg-slate-50 border border-black/15 rounded-xl flex flex-col gap-3 shadow-2xs text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black">
              Assign Site-Specific Hourly Pay Rate
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Target Site */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Designated Site / Facility *
              </label>
              <select
                required
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-black/20 rounded-lg focus:border-black focus:outline-none bg-white"
              >
                <option value="">-- Select Client Site --</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.client?.companyName || 'Client'})
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Rate */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Agreed Guard Hourly Wage (£ GBP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 font-bold text-slate-400">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 15.50"
                  value={payRateHour}
                  onChange={(e) => setPayRateHour(e.target.value)}
                  className="pl-7 pr-3 py-1.5 w-full text-xs font-bold border border-black/20 rounded-lg focus:border-black focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Effective From */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Effective Start Date *
              </label>
              <input
                type="date"
                required
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-black/20 rounded-lg focus:border-black focus:outline-none bg-white"
              />
            </div>

            {/* Effective To */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Effective End Date (Optional)
              </label>
              <input
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-black/20 rounded-lg focus:border-black focus:outline-none bg-white"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Assignment Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Premium keyholder site allowance"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-black/20 rounded-lg focus:border-black focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !selectedSiteId || !payRateHour}
              className="px-4 py-1.5 bg-[#032031] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {actionLoading ? 'Saving...' : 'Save Site Rate'}
            </button>
          </div>
        </form>
      )}

      {/* Rates List */}
      {loading ? (
        <div className="p-6 text-center text-xs font-bold text-slate-400">
          Loading site pay rates...
        </div>
      ) : rates.length === 0 ? (
        <div className="p-6 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-slate-400">
          <Coins className="w-8 h-8 text-slate-300" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
            No Site-Specific Pay Rates Configured
          </span>
          <span className="text-[10px] font-medium text-slate-500 max-w-sm">
            This officer currently receives their standard default wage (£{baselineRate || '0.00'}/hr) across all shifts.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className="p-3.5 bg-slate-50 border border-slate-200 hover:border-black/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-700 shadow-2xs shrink-0">
                  <Building2 className="w-4 h-4 text-[#032031]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-black">
                      {rate.site?.name || 'Assigned Site'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      £{Number(rate.payRateHour).toFixed(2)}/hr
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold flex-wrap">
                    {rate.site?.client?.companyName && (
                      <>
                        <span>{rate.site.client.companyName}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>From: {new Date(rate.effectiveFrom).toLocaleDateString('en-GB')}</span>
                    {rate.effectiveTo && (
                      <>
                        <span>•</span>
                        <span>Until: {new Date(rate.effectiveTo).toLocaleDateString('en-GB')}</span>
                      </>
                    )}
                    {rate.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-600 font-medium">{rate.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {canEditRates && (
                <button
                  type="button"
                  onClick={() => handleDeleteRate(rate.id, rate.site?.name || 'Site')}
                  className="p-1.5 text-red-500 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition cursor-pointer self-end sm:self-center"
                  title="Remove site pay rate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
