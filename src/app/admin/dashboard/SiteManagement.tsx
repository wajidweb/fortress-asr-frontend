'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { adminService, AdminSite } from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { LocationPickerMap } from '@/components/maps';
import { ContractsSection } from './ContractsSection';
import { 
  Building2, 
  MapPin, 
  Compass, 
  Users, 
  Search, 
  Edit3, 
  Phone, 
  Check, 
  X, 
  RotateCw, 
  ExternalLink,
  Locate,
  Shield,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  Printer,
  Download,
  Inbox,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins
} from 'lucide-react';

interface SiteManagementProps {
  onNavigateToRequests?: () => void;
}

export const SiteManagement: React.FC<SiteManagementProps> = ({ onNavigateToRequests }) => {
  const addToast = useUIStore((state) => state.addToast);

  // Data & loading states
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE_GUARDS'>('ALL');
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'guards'>('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Row Selection State for Targeted Export / Print
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Edit Geofence Modal State
  const [editingSite, setEditingSite] = useState<AdminSite | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    latitude: 51.5074,
    longitude: -0.1278,
    geofenceRadiusMeters: 100,
    siteInstructions: '',
    emergencyContact: '',
    billingRateHour: 0,
    vatTreatment: 'STANDARD_20',
  });
  const [saving, setSaving] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);

  // Fetch updated sites data from API
  const loadSites = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminService.getAllSites();
      setSites(res.sites || []);
      if (isManualRefresh) {
        addToast('Site registry refreshed with latest live data.', 'info');
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to retrieve active properties', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // Unique clients for filtering dropdown
  const uniqueClients = useMemo(() => {
    const map = new Map<string, string>();
    sites.forEach((s) => {
      if (s.client?.id && s.client?.companyName) {
        map.set(s.client.id, s.client.companyName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sites]);

  // Metrics calculations
  const totalOfficersOnDuty = useMemo(() => {
    return sites.reduce((sum, s) => sum + (s.activeOfficersCount || 0), 0);
  }, [sites]);

  const totalCompletedShifts = useMemo(() => {
    return sites.reduce((sum, s) => sum + (s.totalShifts || 0), 0);
  }, [sites]);

  const sitesWithActiveGuardsCount = useMemo(() => {
    return sites.filter((s) => (s.activeOfficersCount || 0) > 0).length;
  }, [sites]);

  // Filtered & Sorted sites
  const filteredSites = useMemo(() => {
    let result = sites.filter((site) => {
      // Tab filter
      if (activeTab === 'ACTIVE_GUARDS' && (site.activeOfficersCount || 0) === 0) {
        return false;
      }
      // Client organization filter
      if (selectedClient !== 'ALL' && site.client?.id !== selectedClient) {
        return false;
      }
      // Search query filter
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        site.name.toLowerCase().includes(q) ||
        site.address.toLowerCase().includes(q) ||
        (site.client?.companyName && site.client.companyName.toLowerCase().includes(q)) ||
        (site.emergencyContact && site.emergencyContact.toLowerCase().includes(q))
      );
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'guards') return (b.activeOfficersCount || 0) - (a.activeOfficersCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [sites, activeTab, selectedClient, searchQuery, sortBy]);

  // Paginated sites
  const totalPages = Math.ceil(filteredSites.length / pageSize) || 1;
  const paginatedSites = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSites.slice(start, start + pageSize);
  }, [filteredSites, page]);

  // Average billing rate across all sites
  const averageBillingRate = useMemo(() => {
    const sitesWithRates = sites.filter((s) => Number(s.billingRateHour || s.client?.billingRateHour || 0) > 0);
    if (sitesWithRates.length === 0) return '0.00';
    const sum = sitesWithRates.reduce((acc, s) => acc + Number(s.billingRateHour || s.client?.billingRateHour || 0), 0);
    return (sum / sitesWithRates.length).toFixed(2);
  }, [sites]);

  // Selection handlers
  const isAllVisibleSelected = paginatedSites.length > 0 && paginatedSites.every((s) => selectedIds.includes(s.id));
  const isSomeVisibleSelected = paginatedSites.some((s) => selectedIds.includes(s.id)) && !isAllVisibleSelected;

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleIds = paginatedSites.map((s) => s.id);
      setSelectedIds(selectedIds.filter((id) => !visibleIds.includes(id)));
    } else {
      const newSelected = Array.from(new Set([...selectedIds, ...paginatedSites.map((s) => s.id)]));
      setSelectedIds(newSelected);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // CSV Export & Print Handlers
  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const handleExportCSV = () => {
    const targetSites = selectedIds.length > 0 
      ? sites.filter((s) => selectedIds.includes(s.id))
      : filteredSites;

    if (targetSites.length === 0) {
      addToast('No properties available to export', 'error');
      return;
    }

    const headers = [
      'Site Name',
      'Client Organization',
      'Hourly Billing Rate (£/hr)',
      'VAT Treatment',
      'Address',
      'Latitude',
      'Longitude',
      'Geofence Radius (Meters)',
      'Active Guards On Duty',
      'Total Shifts',
      'Emergency Contact',
      'Site Standing Orders',
      'Created Date'
    ];

    const rows = targetSites.map((s) => [
      escapeCsv(s.name),
      escapeCsv(s.client?.companyName),
      escapeCsv(s.billingRateHour && Number(s.billingRateHour) > 0 ? `£${Number(s.billingRateHour).toFixed(2)}/hr` : s.client?.billingRateHour ? `£${Number(s.client.billingRateHour).toFixed(2)}/hr (Client Default)` : 'Unassigned'),
      escapeCsv(s.vatTreatment || 'STANDARD_20'),
      escapeCsv(s.address),
      escapeCsv(s.latitude),
      escapeCsv(s.longitude),
      escapeCsv(s.geofenceRadiusMeters),
      escapeCsv(s.activeOfficersCount),
      escapeCsv(s.totalShifts),
      escapeCsv(s.emergencyContact),
      escapeCsv(s.siteInstructions),
      escapeCsv(new Date(s.createdAt).toISOString().slice(0, 10))
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fortress-monitored-sites-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${targetSites.length} properties to CSV`, 'success');
  };

  const handlePrintReport = () => {
    const targetSites = selectedIds.length > 0
      ? sites.filter((s) => selectedIds.includes(s.id))
      : filteredSites;

    if (targetSites.length === 0) {
      addToast('No properties available to print', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('Popup blocker prevented print preview. Please allow popups.', 'error');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fortress ASR - Monitored Property Registry</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #111; }
          .header { border-bottom: 2px solid #032031; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: 900; color: #032031; text-transform: uppercase; margin: 0; }
          .meta { font-size: 11px; color: #666; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background: #032031; color: #fff; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { border-bottom: 1px solid #ddd; padding: 8px 10px; vertical-align: top; }
          tr:nth-child(even) { background-color: #fcfcfc; }
          .badge { display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: bold; border-radius: 4px; text-transform: uppercase; background: #e0f2fe; color: #0369a1; }
          .footer { margin-top: 30px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Fortress ASR - Monitored Properties Registry</h1>
            <div class="meta">Exported on: ${new Date().toUTCString()}</div>
          </div>
          <div class="meta">Records: ${targetSites.length} Verified Properties</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Property Name</th>
              <th>Client Organization</th>
              <th>Billing Rate (£/hr)</th>
              <th>VAT Treatment</th>
              <th>Address</th>
              <th>GPS Geofence</th>
              <th>Radius</th>
              <th>Guards Active</th>
              <th>Emergency Contact</th>
            </tr>
          </thead>
          <tbody>
            ${targetSites.map((s) => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.client?.companyName || 'Corporate Client'}</td>
                <td><strong style="color: #15803d;">${s.billingRateHour && Number(s.billingRateHour) > 0 ? `£${Number(s.billingRateHour).toFixed(2)}/hr` : s.client?.billingRateHour ? `£${Number(s.client.billingRateHour).toFixed(2)}/hr (Client Default)` : 'Unassigned'}</strong></td>
                <td>${s.vatTreatment || 'STANDARD_20'}</td>
                <td>${s.address}</td>
                <td>${Number(s.latitude).toFixed(4)}, ${Number(s.longitude).toFixed(4)}</td>
                <td><span class="badge">${s.geofenceRadiusMeters || 100}m</span></td>
                <td>${s.activeOfficersCount > 0 ? `<strong style="color: #15803d;">${s.activeOfficersCount} On Duty</strong>` : '0'}</td>
                <td>${s.emergencyContact || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Fortress ASR Security Operations Management System (SOMS) &bull; Confidential Operational Infrastructure Registry
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // Edit Modal Handlers
  const handleOpenEdit = (site: AdminSite) => {
    setEditingSite(site);
    const effectiveBilling = site.billingRateHour !== undefined && site.billingRateHour !== null
      ? Number(site.billingRateHour)
      : site.client?.billingRateHour
      ? Number(site.client.billingRateHour)
      : 0;

    setEditForm({
      name: site.name,
      address: site.address,
      latitude: Number(site.latitude) || 51.5074,
      longitude: Number(site.longitude) || -0.1278,
      geofenceRadiusMeters: site.geofenceRadiusMeters || 100,
      siteInstructions: site.siteInstructions || '',
      emergencyContact: site.emergencyContact || '',
      billingRateHour: effectiveBilling,
      vatTreatment: site.vatTreatment || 'STANDARD_20',
    });
  };

  const handleCaptureLiveLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setEditForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        addToast(`GPS captured: ${lat}, ${lng} (±${Math.round(pos.coords.accuracy)}m)`, 'success');
      },
      (err) => {
        setLocatingGps(false);
        addToast(`Failed to capture location: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    setSaving(true);
    try {
      await adminService.updateSite(editingSite.id, {
        name: editForm.name.trim(),
        address: editForm.address.trim(),
        latitude: Number(editForm.latitude),
        longitude: Number(editForm.longitude),
        geofenceRadiusMeters: Number(editForm.geofenceRadiusMeters),
        siteInstructions: editForm.siteInstructions || null,
        emergencyContact: editForm.emergencyContact || null,
        billingRateHour: editForm.billingRateHour !== undefined ? Number(editForm.billingRateHour) : undefined,
        vatTreatment: editForm.vatTreatment || null,
      });

      addToast(`Property "${editForm.name}" updated successfully.`, 'success');
      setEditingSite(null);
      await loadSites();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update property details', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in pb-12 select-none">
      
      {/* 1. Top Operations Banner */}
      <div className="w-full bg-white border border-black rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Site Operations & Infrastructure
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/30" />
            <span className="text-[10px] font-bold text-black/50">Geofence Registry</span>
          </div>
          <h1 className="text-2xl font-black text-[#032031] tracking-tight">
            Monitored Property Management
          </h1>
          <p className="text-xs text-black/70 font-semibold leading-relaxed">
            Manage physical client properties, circular GPS geofences, and site instructions. Guards assigned to these sites are strictly geofence-validated upon camera check-in.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => loadSites(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-black/30 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Fetch latest data from database"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {onNavigateToRequests && (
            <button
              onClick={onNavigateToRequests}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#032031] hover:bg-black text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
            >
              <span>Deployment Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Row (Matching SiteRequestsManagement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Active Sites */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition bg-gradient-to-br from-slate-50/60 to-white">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
              Monitored Properties
            </span>
            <span className="text-3xl font-black text-[#032031]">
              {sites.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#032031] text-white flex items-center justify-center shadow-inner shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Officers On Duty */}
        <div className="bg-white border border-emerald-300 rounded-xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition bg-gradient-to-br from-emerald-50/60 to-white">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Guards On Duty
            </span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-emerald-700">
                {totalOfficersOnDuty}
              </span>
              {totalOfficersOnDuty > 0 && (
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-inner shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Sites With Active Guards */}
        <div className="bg-white border border-blue-300 rounded-xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition bg-gradient-to-br from-blue-50/60 to-white">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">
              Occupied Sites
            </span>
            <span className="text-3xl font-black text-blue-700">
              {sitesWithActiveGuardsCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-inner shrink-0">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Commercial Billing Rates */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition bg-gradient-to-br from-indigo-50/50 to-white">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900">
              Avg Client Rate (£ GBP)
            </span>
            <span className="text-3xl font-black text-[#032031]">
              £{averageBillingRate}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {sites.filter((s) => Number(s.billingRateHour || s.client?.billingRateHour || 0) > 0).length} of {sites.length} rated properties
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-inner shrink-0">
            <Coins className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Table & Controls Card */}
      <div className="bg-white border border-black rounded-xl flex flex-col overflow-hidden shadow-xs">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-black/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50/70">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: `All Properties (${sites.length})` },
              { id: 'ACTIVE_GUARDS', label: `Guards On Site (${sitesWithActiveGuardsCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer
                  ${activeTab === tab.id 
                    ? 'bg-[#032031] text-white shadow-xs' 
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Client Filter, and Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Client Organization Dropdown */}
            {uniqueClients.length > 0 && (
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 border border-black/30 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="ALL">All Clients ({uniqueClients.length})</option>
                {uniqueClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-1.5 border border-black/30 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="name">Property Name (A-Z)</option>
              <option value="guards">Most Active Guards</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search property, address, client..."
                className="w-full pl-8 pr-7 py-1.5 border border-black/30 rounded-lg text-xs font-medium focus:outline-none focus:border-black bg-white"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/40" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-black/40 hover:text-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadSites(true)}
              disabled={loading || isRefreshing}
              className="p-1.5 border border-black/30 hover:border-black rounded-lg text-[#032031] hover:bg-black/5 transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Refresh sites list"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            </button>

          </div>
        </div>

        {/* Selected Rows Action Bar (Bulk Print / Export) */}
        {selectedIds.length > 0 && (
          <div className="px-4 py-2.5 bg-[#032031] text-white border-b border-black/10 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                {selectedIds.length} {selectedIds.length === 1 ? 'Property' : 'Properties'} Selected
              </span>
              <span className="text-white/40">|</span>
              <button
                onClick={handleClearSelection}
                className="text-[11px] font-bold text-white/80 hover:text-white underline cursor-pointer"
              >
                Clear selection
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintReport}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Selected ({selectedIds.length})</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Properties Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <LoaderRectangle />
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Loading property registry...
            </span>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4 gap-3">
            <Inbox className="w-10 h-10 text-black/20" />
            <h3 className="text-sm font-black text-black uppercase tracking-wider">
              No properties found
            </h3>
            <p className="text-xs text-black/60 max-w-md font-medium">
              {searchQuery || selectedClient !== 'ALL' || activeTab !== 'ALL'
                ? 'No client properties matched your search filters.'
                : 'No client properties have been provisioned yet. Approved site requests will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02] text-[9px] font-black uppercase tracking-wider text-black/60">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeVisibleSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-black/30 text-[#032031] focus:ring-1 focus:ring-[#032031] cursor-pointer"
                      title="Select/Deselect visible properties"
                    />
                  </th>
                  <th className="py-3 px-4">Property & Address</th>
                  <th className="py-3 px-4">Client Organization</th>
                  <th className="py-3 px-4">Billing Rate (£/hr)</th>
                  <th className="py-3 px-4">GPS Geofence Centerpoint</th>
                  <th className="py-3 px-4">Guards On Duty</th>
                  <th className="py-3 px-4">Total Deployments</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {paginatedSites.map((site) => (
                  <tr
                    key={site.id}
                    onClick={() => handleOpenEdit(site)}
                    className={`transition cursor-pointer ${
                      selectedIds.includes(site.id)
                        ? 'bg-blue-50/60 hover:bg-blue-50/80'
                        : 'hover:bg-black/[0.025]'
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3.5 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(site.id)}
                        onChange={() => handleToggleSelectRow(site.id)}
                        className="w-4 h-4 rounded border-black/30 text-[#032031] focus:ring-1 focus:ring-[#032031] cursor-pointer"
                      />
                    </td>

                    {/* Property & Address */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 max-w-sm">
                        <span className="font-bold text-[#032031] text-xs leading-snug">
                          {site.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-black/60 text-[11px]">
                          <MapPin className="w-3 h-3 text-black/40 shrink-0" />
                          <span className="truncate">{site.address}</span>
                        </div>
                        {site.emergencyContact && (
                          <div className="flex items-center gap-1 text-[10px] text-black/50 font-medium mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-black/40 shrink-0" />
                            <span className="truncate">{site.emergencyContact}</span>
                          </div>
                        )}
                        {site.serviceRequest?.surveyLatitude && (
                          <div className="flex items-center gap-1 text-[9px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1 w-fit">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Certified Surveyed GPS ({site.serviceRequest.surveyGeofenceRadiusMeters || 100}m)</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Client Organization */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black/5 border border-black/10 flex items-center justify-center text-[11px] font-black overflow-hidden relative shrink-0">
                          {site.client?.logoUrl ? (
                            <img
                              src={getFullImageUrl(site.client.logoUrl)}
                              alt="Client"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            site.client?.companyName?.[0] || 'C'
                          )}
                        </div>
                        <div className="flex flex-col truncate max-w-[170px]">
                          <span className="font-bold text-[#032031] text-xs truncate">
                            {site.client?.companyName || 'Corporate Client'}
                          </span>
                          <span className="text-[10px] text-black/50 truncate">
                            ID: {site.client?.id?.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Agreed Billing Rate */}
                    <td className="py-3.5 px-4">
                      {site.billingRateHour && Number(site.billingRateHour) > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                            £{Number(site.billingRateHour).toFixed(2)}/hr
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {site.vatTreatment ? site.vatTreatment.replace('_', ' ') : 'Site Rate'}
                          </span>
                        </div>
                      ) : site.serviceRequest?.chargeRatePerHour && Number(site.serviceRequest.chargeRatePerHour) > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-300 w-fit">
                            £{Number(site.serviceRequest.chargeRatePerHour).toFixed(2)}/hr
                          </span>
                          <span className="text-[9px] text-indigo-700 font-medium">Request Agreed</span>
                        </div>
                      ) : site.client?.billingRateHour && Number(site.client.billingRateHour) > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 w-fit">
                            £{Number(site.client.billingRateHour).toFixed(2)}/hr
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">Client Default</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 w-fit">
                            £0.00/hr
                          </span>
                          <span className="text-[9px] text-amber-700 font-medium">Needs Rate Setup</span>
                        </div>
                      )}
                    </td>

                    {/* GPS Coordinates & Geofence Radius */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Compass className="w-3 h-3 text-indigo-600" />
                          {site.geofenceRadiusMeters || 100}m Geofence
                        </span>

                        <span className="text-[10px] font-mono text-black/60 font-semibold">
                          {Number(site.latitude).toFixed(6)}, {Number(site.longitude).toFixed(6)}
                        </span>
                      </div>
                    </td>

                    {/* Guards On Duty */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {site.activeOfficersCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {site.activeOfficersCount} On Duty
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/5 text-black/40">
                            0 Active
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Deployments */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#032031] text-xs">
                          {site.totalShifts || 0} Shifts
                        </span>
                        <span className="text-[10px] text-black/50">
                          {site.totalIncidents || 0} Incidents Logged
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(site);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#032031] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>View Details & Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-zinc-50/70">
          <span className="text-black/60 font-bold text-[11px]">
            Showing {filteredSites.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(page * pageSize, filteredSites.length)} of {filteredSites.length} Properties
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-black/20 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-black"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-xs font-black text-[#032031]">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-black/20 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-black"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Edit Property & Geofence Modal (Expanded 2-Column Responsive Layout with Live Satellite Map) */}
      {editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-[#032031] text-white shrink-0">
              <div className="flex items-center gap-3 truncate">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/15 text-emerald-400 shrink-0">
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300">
                    Geofence Calibration & Property Settings
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-white truncate">
                    {editingSite.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setEditingSite(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                title="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Form with Comprehensive Responsive 2-Column Grid */}
            <form id="edit-site-form" onSubmit={handleSaveEdit} className="flex flex-col flex-grow overflow-hidden">
              
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 text-xs text-slate-800 bg-white">
                
                {/* Left Column (7 cols on lg): Live Spatial Geofence, Location Analytics & Client Profile */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  
                  {/* Client Organization & Contract Identity */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black overflow-hidden relative shrink-0 text-[#032031]">
                        {editingSite.client?.logoUrl ? (
                          <img src={getFullImageUrl(editingSite.client.logoUrl)} alt="Client" className="w-full h-full object-cover" />
                        ) : (
                          editingSite.client?.companyName?.[0] || 'C'
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Client Organization</span>
                        <span className="font-black text-[#032031] text-xs sm:text-sm truncate">{editingSite.client?.companyName || 'Corporate Client'}</span>
                        <span className="text-[10px] text-slate-500 truncate font-mono">
                          ID: {editingSite.client?.id?.slice(0, 12)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-white border border-slate-200 text-[#032031]">
                        Active Facility
                      </span>
                      {editingSite.createdAt && (
                        <span className="text-[9px] text-slate-400 font-semibold hidden sm:inline">
                          Created {new Date(editingSite.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interactive GPS Geofence Map Section */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                    
                    {/* Map Header with GPS Capture */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-700" />
                        <span className="font-black text-[#032031] text-xs uppercase tracking-wider">
                          Geofence Perimeter & Spatial Satellite Map
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCaptureLiveLocation}
                        disabled={locatingGps}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-100 text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Acquire live device coordinates"
                      >
                        <Locate className={`w-3 h-3 ${locatingGps ? 'animate-spin' : ''}`} />
                        <span>{locatingGps ? 'Locating...' : 'Use My GPS'}</span>
                      </button>
                    </div>

                    {/* Interactive Leaflet Map with Satellite Imagery */}
                    <div className="w-full">
                      <LocationPickerMap
                        latitude={editForm.latitude}
                        longitude={editForm.longitude}
                        radiusMeters={editForm.geofenceRadiusMeters}
                        onChange={(lat, lng) => {
                          setEditForm((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                          }));
                        }}
                        height="300px"
                        zoom={17}
                        interactive={true}
                      />
                    </div>

                    {/* Coordinates Readout */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-700 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 font-jakarta">Centerpoint:</span>
                        <span className="text-[#032031]">
                          {Number(editForm.latitude).toFixed(6)}, {Number(editForm.longitude).toFixed(6)}
                        </span>
                      </div>

                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-jakarta">
                        Geofence Validated
                      </span>
                    </div>

                    {/* Geofence Radius Slider & Quick Select Pills */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                        <span>Check-In Perimeter Threshold</span>
                        <span className="text-emerald-700 font-bold font-mono text-xs">
                          {editForm.geofenceRadiusMeters} meters
                        </span>
                      </div>

                      <input
                        type="range"
                        min={25}
                        max={1000}
                        step={25}
                        value={editForm.geofenceRadiusMeters}
                        onChange={(e) => setEditForm({ ...editForm, geofenceRadiusMeters: parseInt(e.target.value, 10) })}
                        className="w-full accent-[#032031] cursor-pointer"
                      />

                      <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                        {[50, 100, 150, 200, 500].map((radius) => (
                          <button
                            type="button"
                            key={radius}
                            onClick={() => setEditForm({ ...editForm, geofenceRadiusMeters: radius })}
                            className={`py-1 rounded-md border text-[10px] font-black uppercase tracking-wider transition cursor-pointer text-center ${
                              editForm.geofenceRadiusMeters === radius
                                ? 'bg-[#032031] text-white border-[#032031]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {radius}m
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Certified On-Site Physical Survey Report Card (100% Accurate Ground Truth) */}
                  {editingSite.serviceRequest?.surveyLatitude && (
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col gap-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-800" />
                          <span className="font-black text-emerald-950 text-xs uppercase tracking-wider">
                            Certified On-Site Survey Report
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (editingSite.serviceRequest?.surveyLatitude && editingSite.serviceRequest?.surveyLongitude) {
                              setEditForm((prev) => ({
                                ...prev,
                                latitude: Number(editingSite.serviceRequest!.surveyLatitude),
                                longitude: Number(editingSite.serviceRequest!.surveyLongitude),
                                geofenceRadiusMeters: Number(editingSite.serviceRequest!.surveyGeofenceRadiusMeters || 100),
                              }));
                              addToast('Applied certified survey coordinates to active map!', 'success');
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
                          title="Sync map coordinates to physical survey findings"
                        >
                          Use Survey GPS
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-emerald-900/60">Surveyed Centerpoint</span>
                          <span className="font-mono font-bold text-emerald-950">
                            {Number(editingSite.serviceRequest.surveyLatitude).toFixed(6)}, {Number(editingSite.serviceRequest.surveyLongitude).toFixed(6)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-emerald-900/60">Surveyed Radius</span>
                          <span className="font-bold text-emerald-950">
                            {editingSite.serviceRequest.surveyGeofenceRadiusMeters || 100} meters
                          </span>
                        </div>
                      </div>

                      {editingSite.serviceRequest.surveyContactName && (
                        <div className="flex flex-col text-[11px] pt-1 border-t border-emerald-200">
                          <span className="text-[9px] font-black uppercase text-emerald-900/60">Site Contact Met On-Site</span>
                          <span className="font-bold text-emerald-950">
                            {editingSite.serviceRequest.surveyContactName} {editingSite.serviceRequest.surveyContactPhone ? `(${editingSite.serviceRequest.surveyContactPhone})` : ''}
                          </span>
                        </div>
                      )}

                      {editingSite.serviceRequest.surveyNotes && (
                        <div className="flex flex-col text-[11px] pt-1 border-t border-emerald-200">
                          <span className="text-[9px] font-black uppercase text-emerald-900/60">Physical Inspection Notes & Findings</span>
                          <p className="text-slate-800 font-medium whitespace-pre-wrap mt-0.5 bg-white/70 p-2 rounded-lg border border-emerald-200/60">
                            {editingSite.serviceRequest.surveyNotes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-emerald-900/70 pt-1 font-medium">
                        {editingSite.serviceRequest.visitAssignee && (
                          <span>Inspected By: {editingSite.serviceRequest.visitAssignee.firstName} {editingSite.serviceRequest.visitAssignee.lastName}</span>
                        )}
                        {editingSite.serviceRequest.surveyConductedAt && (
                          <span>{new Date(editingSite.serviceRequest.surveyConductedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column (5 cols on lg): Property Configurations, Standing Orders, Live Personnel & Stats */}
                <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-5 lg:pt-0">
                  
                  {/* Originating Service Request Specifications */}
                  {editingSite.serviceRequest && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col gap-2.5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-700" />
                          Originating Service Request
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          {editingSite.serviceRequest.type} &bull; {editingSite.serviceRequest.urgency}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-slate-500">Required Officers</span>
                          <span className="font-bold text-[#032031]">{editingSite.serviceRequest.requiredGuardsCount} Officer(s)</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-slate-500">Contract Term</span>
                          <span className="font-bold text-[#032031]">
                            {new Date(editingSite.serviceRequest.serviceStartDate).toLocaleDateString()}
                            {editingSite.serviceRequest.serviceEndDate ? ` - ${new Date(editingSite.serviceRequest.serviceEndDate).toLocaleDateString()}` : ' (Ongoing)'}
                          </span>
                        </div>
                      </div>

                      {editingSite.serviceRequest.shiftScheduleNotes && (
                        <div className="flex flex-col text-[11px]">
                          <span className="text-[9px] font-black uppercase text-slate-500">Client Shift Notes</span>
                          <span className="text-slate-700 font-medium">{editingSite.serviceRequest.shiftScheduleNotes}</span>
                        </div>
                      )}

                      {editingSite.serviceRequest.specialInstructions && (
                        <div className="flex flex-col text-[11px]">
                          <span className="text-[9px] font-black uppercase text-slate-500">Client Special Instructions</span>
                          <span className="text-slate-700 font-medium">{editingSite.serviceRequest.specialInstructions}</span>
                        </div>
                      )}

                      {editingSite.serviceRequest.adminFeedbackNotes && (
                        <div className="flex flex-col text-[11px] pt-1 border-t border-slate-200">
                          <span className="text-[9px] font-black uppercase text-slate-500">Admin Deployment Review Notes</span>
                          <span className="text-slate-700 font-medium">{editingSite.serviceRequest.adminFeedbackNotes}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Property Identification */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Building2 className="w-3.5 h-3.5 text-[#032031]" />
                      Property Identification
                    </span>

                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                          Property Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="e.g., Mayfair Retail Gallery"
                          className="h-10 px-3 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] bg-white transition"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                          Full Physical Address *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          placeholder="Street, City, Postal Code"
                          className="p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#032031] bg-white resize-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duty Emergency Contact */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Phone className="w-3.5 h-3.5 text-blue-700" />
                      Duty Emergency Escalation
                    </span>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                        Emergency Hotline / Manager Phone
                      </label>
                      <input
                        type="text"
                        value={editForm.emergencyContact}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        placeholder="e.g., Control Room - 020 7946 0192"
                        className="h-10 px-3 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#032031] bg-white transition"
                      />
                      <span className="text-[10px] text-slate-500">
                        Accessible by guards during active shift emergency escalation.
                      </span>
                    </div>
                  </div>

                  {/* Site Standing Orders */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      Site Standing Orders & Guard Protocols
                    </span>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                        Access Codes, Patrol Instructions & Hazard Notes
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.siteInstructions}
                        onChange={(e) => setEditForm({ ...editForm, siteInstructions: e.target.value })}
                        placeholder="Key safe access codes, perimeter patrol intervals, alarm protocols, gate opening hours..."
                        className="p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#032031] bg-white resize-none transition"
                      />
                    </div>
                  </div>

                  {/* Commercial Billing & VAT Configuration */}
                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex flex-col gap-3 shadow-2xs">
                    <span className="font-black text-indigo-950 text-xs uppercase tracking-wider flex items-center justify-between border-b border-indigo-200/70 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-indigo-700" />
                        Commercial Billing Terms (£ GBP)
                      </span>
                      <span className="text-[9px] font-bold text-indigo-800">
                        Client Base: £{Number(editingSite.client?.billingRateHour || 0).toFixed(2)}/hr
                      </span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                          Site Hourly Billing Rate (£/hr) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 font-bold text-slate-400 text-xs">£</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editForm.billingRateHour || ''}
                            onChange={(e) => setEditForm({ ...editForm, billingRateHour: e.target.value ? parseFloat(e.target.value) : 0 })}
                            placeholder="e.g. 24.50"
                            className="pl-7 pr-3 h-9 w-full border border-slate-300 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-[#032031]"
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 font-medium">Applied to all scheduled shifts for this site.</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                          VAT Treatment
                        </label>
                        <select
                          value={editForm.vatTreatment}
                          onChange={(e) => setEditForm({ ...editForm, vatTreatment: e.target.value })}
                          className="h-9 px-2.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-[#032031]"
                        >
                          <option value="STANDARD_20">Standard UK VAT (20%)</option>
                          <option value="EXEMPT">Exempt from VAT</option>
                          <option value="ZERO_RATED">Zero-Rated Supplies (0%)</option>
                          <option value="REVERSE_CHARGE">Domestic Reverse Charge</option>
                        </select>
                        <span className="text-[9px] text-slate-500 font-medium">VAT treatment on client charges.</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Guards On-Site Roster */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col gap-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#032031] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-700" />
                        Live Guard Roster
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">
                        {editingSite.activeOfficersCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {editingSite.activeOfficersCount} On Duty
                          </span>
                        ) : (
                          <span className="text-slate-400">0 Active Guards</span>
                        )}
                      </span>
                    </div>

                    {editingSite.activeShifts && editingSite.activeShifts.length > 0 ? (
                      <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-200">
                        {editingSite.activeShifts.map((shift: any) => (
                          <div key={shift.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#032031] text-white flex items-center justify-center text-[10px] font-bold">
                                {shift.guard?.firstName?.[0] || 'G'}
                              </div>
                              <span className="font-bold text-[#032031]">
                                {shift.guard?.firstName} {shift.guard?.lastName}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Clocked In
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        No security officers are currently clocked in at this property.
                      </p>
                    )}
                  </div>

                  {/* Comprehensive Operational Dossier & Stats */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-3 gap-2 text-center shadow-2xs">
                    <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-black uppercase text-slate-400">Total Shifts</span>
                      <span className="text-sm font-black text-[#032031]">{editingSite.totalShifts || 0}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-black uppercase text-slate-400">Incidents</span>
                      <span className="text-sm font-black text-rose-700">{editingSite.totalIncidents || 0}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-black uppercase text-slate-400">Patrol Routes</span>
                      <span className="text-sm font-black text-indigo-700">{editingSite.totalPatrolRoutes || 0}</span>
                    </div>
                  </div>

                  {/* Site Signed Contracts & Addendums */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <ContractsSection
                      siteId={editingSite.id}
                      clientId={editingSite.client.id}
                      entityName={editingSite.name}
                    />
                  </div>

                </div>

              </div>

              {/* Modal Actions Footer: Fully Responsive */}
              <div className="p-3.5 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Perimeter adjustments apply immediately to active guard GPS validation.
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingSite(null)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-300 rounded-xl font-bold hover:bg-slate-100 text-slate-700 text-xs transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="edit-site-form"
                    disabled={saving}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#032031] hover:bg-black text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
                  >
                    {saving ? (
                      <>
                        <LoaderRectangle />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default SiteManagement;
