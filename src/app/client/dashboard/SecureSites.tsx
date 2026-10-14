'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { clientService, ClientSite } from '@/services/client.service';
import { useUIStore } from '@/store/useUIStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { LocationPickerMap } from '@/components/maps';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Search, 
  Plus, 
  Compass, 
  Phone, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Calendar
} from 'lucide-react';

interface SecureSitesProps {
  onNavigateToRequests: () => void;
}

export const SecureSites: React.FC<SecureSitesProps> = ({ onNavigateToRequests }) => {
  const addToast = useUIStore((state) => state.addToast);

  const [sites, setSites] = useState<ClientSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'officers-desc' | 'newest'>('name-asc');
  const [selectedSite, setSelectedSite] = useState<ClientSite | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const loadSites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientService.getSites();
      setSites(res.sites || []);
      
      if (selectedSite) {
        const fresh = res.sites.find((s) => s.id === selectedSite.id);
        if (fresh) setSelectedSite(fresh);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to retrieve monitored physical sites', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, selectedSite]);

  useEffect(() => {
    loadSites();
  }, []);

  // Filtered and Sorted Sites
  const filteredSites = useMemo(() => {
    let result = [...sites];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (site) =>
          site.name.toLowerCase().includes(q) ||
          site.address.toLowerCase().includes(q) ||
          (site.emergencyContact && site.emergencyContact.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'officers-desc':
          return b.activeOfficersCount - a.activeOfficersCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [sites, searchQuery, sortBy]);

  // Paginated Sites
  const paginatedSites = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSites.slice(start, start + pageSize);
  }, [filteredSites, page]);

  const totalPages = Math.ceil(filteredSites.length / pageSize) || 1;

  // Aggregate Metrics
  const totalActiveOfficers = useMemo(() => {
    return sites.reduce((sum, s) => sum + s.activeOfficersCount, 0);
  }, [sites]);

  const totalCompletedShifts = useMemo(() => {
    return sites.reduce((sum, s) => sum + (s.totalShifts || 0), 0);
  }, [sites]);

  const totalIncidentsLogged = useMemo(() => {
    return sites.reduce((sum, s) => sum + (s.totalIncidents || 0), 0);
  }, [sites]);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* 1. Header Banner: Compact & Clean */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg sm:text-xl font-black text-[#032031] tracking-tight">Monitored Secure Sites</h1>
          <p className="text-xs text-slate-500 font-medium">
            Active contracted real estate under 24/7 verified GPS geofence security.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadSites}
            disabled={loading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Refresh Site Registry"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onNavigateToRequests}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#032031] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Request Site Deployment
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Contracted Sites */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Contracted Facilities
            </span>
            <span className="text-2xl font-black text-[#032031]">
              {sites.length}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">100% Geofenced Active Sites</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[#032031]">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Live Officers On Duty */}
        <div className="bg-white border border-emerald-300 rounded-2xl p-5 flex items-center justify-between shadow-2xs bg-emerald-50/20">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Officers On Duty Now
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-700">
                {totalActiveOfficers}
              </span>
              {totalActiveOfficers > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] text-emerald-800 font-bold">Physically Clocked-In Guards</span>
          </div>
          <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Total Completed Shifts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Guard Shifts
            </span>
            <span className="text-2xl font-black text-[#032031]">
              {totalCompletedShifts}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">Verified Shift Records</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[#032031]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Perimeter Status */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 flex items-center justify-between shadow-2xs bg-indigo-50/20">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
              Perimeter Protection
            </span>
            <span className="text-2xl font-black text-indigo-900">
              Active
            </span>
            <span className="text-[10px] text-indigo-700 font-bold">
              {totalIncidentsLogged === 0 ? '0 Incidents Reported' : `${totalIncidentsLogged} Incident Logs Recorded`}
            </span>
          </div>
          <div className="p-3.5 bg-indigo-100 text-indigo-800 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. Action Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        
        {/* Left Side: Search Bar */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search properties by name, address, or emergency phone..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] bg-white transition"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Right Side: Sorting & Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#032031] bg-white text-slate-700 cursor-pointer transition"
          >
            <option value="name-asc">Sort: Name (A &rarr; Z)</option>
            <option value="name-desc">Sort: Name (Z &rarr; A)</option>
            <option value="officers-desc">Sort: Most Officers Active</option>
            <option value="newest">Sort: Newest First</option>
          </select>

          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
            {filteredSites.length} {filteredSites.length === 1 ? 'Site' : 'Sites'}
          </span>
        </div>

      </div>

      {/* 4. SOMS Table View */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Loading contracted properties...</span>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center px-4 gap-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <Building2 className="w-12 h-12 text-slate-300" />
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-base font-black text-[#032031] uppercase tracking-wider">No Monitored Sites Deployed</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {searchQuery
                ? 'No properties matched your search query.'
                : 'Your organization currently has no active property geofences provisioned. Submit a Site Service Request to begin security manning.'
              }
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={onNavigateToRequests}
              className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 bg-[#032031] text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-black transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Request Site Deployment
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left text-xs">
              
              {/* Table Header */}
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[#032031]">
                <tr>
                  <th className="py-3.5 px-4 font-black uppercase text-[10px] tracking-wider">
                    Property & Physical Address
                  </th>
                  <th className="py-3.5 px-4 font-black uppercase text-[10px] tracking-wider">
                    GPS Geofence Perimeter
                  </th>
                  <th className="py-3.5 px-4 font-black uppercase text-[10px] tracking-wider">
                    Officers On Duty
                  </th>
                  <th className="py-3.5 px-4 font-black uppercase text-[10px] tracking-wider">
                    Operational Dossier
                  </th>
                  <th className="py-3.5 px-4 font-black uppercase text-[10px] tracking-wider">
                    Active Since
                  </th>
                  <th className="py-3.5 px-4 font-black uppercase text-[10px] tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {paginatedSites.map((site) => (
                  <tr
                    key={site.id}
                    onClick={() => setSelectedSite(site)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Property & Address */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 max-w-sm">
                        <span className="font-bold text-[#032031] text-xs leading-snug">
                          {site.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{site.address}</span>
                        </div>
                        {site.emergencyContact && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
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

                    {/* GPS Coordinates & Geofence Radius */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Compass className="w-3 h-3 text-indigo-600" />
                          {site.geofenceRadiusMeters || 100}m Geofence
                        </span>

                        <span className="text-[10px] font-mono text-slate-600 font-semibold">
                          {Number(site.latitude).toFixed(6)}, {Number(site.longitude).toFixed(6)}
                        </span>
                      </div>
                    </td>

                    {/* Guards On Duty */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {site.activeOfficersCount > 0 ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {site.activeOfficersCount} On Duty Now
                            </span>
                            {site.activeShifts && site.activeShifts.length > 0 && (
                              <div className="flex items-center -space-x-1 mt-0.5">
                                {site.activeShifts.slice(0, 3).map((s) => (
                                  <div
                                    key={s.id}
                                    title={`${s.guard.firstName} ${s.guard.lastName}`}
                                    className="w-5 h-5 rounded-full bg-[#032031] text-white border border-white text-[9px] font-bold flex items-center justify-center overflow-hidden"
                                  >
                                    {s.guard.profilePictureUrl ? (
                                      <img src={getFullImageUrl(s.guard.profilePictureUrl)} alt="Guard" className="w-full h-full object-cover" />
                                    ) : (
                                      s.guard.firstName?.[0] || 'G'
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                            0 Active
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Operational Summary */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#032031] text-xs">
                          {site.totalShifts || 0} Shifts Logged
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {site.totalIncidents || 0} Incidents &bull; {site.totalPatrolRoutes || 0} Routes
                        </span>
                      </div>
                    </td>

                    {/* Active Since */}
                    <td className="py-3.5 px-4 font-semibold text-slate-600 text-[11px]">
                      {new Date(site.createdAt).toLocaleDateString('en-GB')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSite(site);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#032031] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/70">
            <span className="text-slate-500 font-bold text-[11px]">
              Showing {filteredSites.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, filteredSites.length)} of {filteredSites.length} Properties
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>

              <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-[#032031]">
                {page} / {totalPages}
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 5. CLIENT SITE DETAILS & GEOFENCE INSPECTION MODAL (Spacious 2-Column Responsive Layout) */}
      {selectedSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header: Deep Navy Branding */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-[#032031] text-white shrink-0">
              <div className="flex items-center gap-3 truncate">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/15 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300">
                    SOMS Verified Monitored Real Estate
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-white truncate">
                    {selectedSite.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedSite(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                title="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body: 2-Column Grid */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 text-xs text-slate-800 bg-white">
              
              {/* Left Column (7 cols on lg): Live Spatial Geofence Satellite Map & Survey Dossier */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Physical Facility Identity Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex flex-col truncate">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Contracted Property</span>
                    <span className="font-black text-[#032031] text-xs sm:text-sm truncate">{selectedSite.name}</span>
                    <span className="text-[11px] text-slate-600 truncate font-semibold">{selectedSite.address}</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
                    100% Geofenced
                  </span>
                </div>

                {/* Spatial Geofence Map Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-700" />
                      <span className="font-black text-[#032031] text-xs uppercase tracking-wider">
                        Enforced Geofence Perimeter Map
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-slate-500">
                      Fixed Centerpoint Gate Pin
                    </span>
                  </div>

                  {/* Satellite Map Component (Client View: Interactive Pan/Zoom & Layer Switcher) */}
                  <div className="w-full">
                    <LocationPickerMap
                      latitude={Number(selectedSite.latitude)}
                      longitude={Number(selectedSite.longitude)}
                      radiusMeters={selectedSite.geofenceRadiusMeters || 100}
                      height="300px"
                      zoom={17}
                      interactive={false}
                    />
                  </div>

                  {/* Coordinates & Perimeter Specs */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-700 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 font-jakarta">Centerpoint:</span>
                      <span className="text-[#032031]">
                        {Number(selectedSite.latitude).toFixed(6)}, {Number(selectedSite.longitude).toFixed(6)}
                      </span>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-jakarta">
                      {selectedSite.geofenceRadiusMeters || 100}m Radius
                    </span>
                  </div>

                </div>

                {/* Certified On-Site Physical Survey Report Dossier (If Available) */}
                {selectedSite.serviceRequest?.surveyLatitude && (
                  <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                      <span className="font-black text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-800" />
                        Certified Physical Survey Findings
                      </span>
                      {selectedSite.serviceRequest.surveyConductedAt && (
                        <span className="text-[9px] font-bold text-emerald-800">
                          {new Date(selectedSite.serviceRequest.surveyConductedAt).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>

                    {selectedSite.serviceRequest.visitAssignee && (
                      <div className="text-[11px] text-emerald-950 font-semibold">
                        Inspected by Fortress ASR Operations Officer: <span className="font-bold">{selectedSite.serviceRequest.visitAssignee.firstName} {selectedSite.serviceRequest.visitAssignee.lastName}</span>
                      </div>
                    )}

                    {selectedSite.serviceRequest.surveyContactName && (
                      <div className="text-[11px] text-emerald-950 font-semibold">
                        On-Site Client Representative Met: <span className="font-bold">{selectedSite.serviceRequest.surveyContactName}</span>
                      </div>
                    )}

                    {selectedSite.serviceRequest.surveyNotes && (
                      <div className="flex flex-col gap-1 text-[11px] pt-1 border-t border-emerald-200">
                        <span className="text-[9px] font-black uppercase text-emerald-900/60">Verified Security Findings & Access Notes:</span>
                        <p className="p-2.5 bg-white/70 border border-emerald-200/60 rounded-lg text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                          {selectedSite.serviceRequest.surveyNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Right Column (5 cols on lg): Live Officers Roster, Orders & Emergency Contacts */}
              <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-5 lg:pt-0">
                
                {/* Officers Currently On Duty */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      Live On-Duty Officers
                    </span>
                    <span className="text-[10px] font-bold">
                      {selectedSite.activeOfficersCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {selectedSite.activeOfficersCount} Clocked In
                        </span>
                      ) : (
                        <span className="text-slate-400">0 Active Guards</span>
                      )}
                    </span>
                  </div>

                  {selectedSite.activeShifts && selectedSite.activeShifts.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedSite.activeShifts.map((shift) => (
                        <div key={shift.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#032031] text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden relative shadow-2xs">
                              {shift.guard.profilePictureUrl ? (
                                <img src={getFullImageUrl(shift.guard.profilePictureUrl)} alt="Officer" className="w-full h-full object-cover" />
                              ) : (
                                `${shift.guard.firstName?.[0] || 'G'}`
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-[#032031]">{shift.guard.firstName} {shift.guard.lastName}</span>
                              <span className="text-[10px] text-slate-500 font-medium">SIA Licensed Officer</span>
                            </div>
                          </div>

                          {shift.checkInTime && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                              <Clock className="w-3 h-3 text-emerald-700" />
                              <span>{new Date(shift.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      No security personnel currently clocked into this property.
                    </p>
                  )}
                </div>

                {/* Duty Emergency Contact */}
                {selectedSite.emergencyContact && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-1.5 shadow-2xs">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Phone className="w-3.5 h-3.5 text-blue-700" />
                      Duty Emergency Escalation
                    </span>
                    <span className="text-xs font-bold text-[#032031] flex items-center gap-2 mt-1">
                      {selectedSite.emergencyContact}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Escalation hotline provided to guards during active shift incidents.
                    </span>
                  </div>
                )}

                {/* Site Standing Orders */}
                {selectedSite.siteInstructions && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-1.5 shadow-2xs">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      Site Standing Orders
                    </span>
                    <p className="text-xs text-slate-700 font-medium whitespace-pre-line leading-relaxed mt-1">
                      {selectedSite.siteInstructions}
                    </p>
                  </div>
                )}

                {/* Contract Specifications (If Linked to Service Request) */}
                {selectedSite.serviceRequest && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col gap-2 shadow-2xs">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-700" />
                      Contract Specifications
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-slate-500">Assigned Officers</span>
                        <span className="font-bold text-[#032031]">{selectedSite.serviceRequest.requiredGuardsCount} Officer(s)</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-slate-500">Contract Term</span>
                        <span className="font-bold text-[#032031]">
                          {new Date(selectedSite.serviceRequest.serviceStartDate).toLocaleDateString('en-GB')}
                          {selectedSite.serviceRequest.serviceEndDate ? ` - ${new Date(selectedSite.serviceRequest.serviceEndDate).toLocaleDateString('en-GB')}` : ' (Ongoing)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operational Statistics Dossier */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-3 gap-2 text-center shadow-2xs">
                  <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] font-black uppercase text-slate-400">Total Shifts</span>
                    <span className="text-sm font-black text-[#032031]">{selectedSite.totalShifts || 0}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] font-black uppercase text-slate-400">Incidents</span>
                    <span className="text-sm font-black text-rose-700">{selectedSite.totalIncidents || 0}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] font-black uppercase text-slate-400">Patrols</span>
                    <span className="text-sm font-black text-indigo-700">{selectedSite.totalPatrolRoutes || 0}</span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Site Ref: {selectedSite.id.slice(0, 8)}</span>
                  <span>Active Since: {new Date(selectedSite.createdAt).toLocaleDateString('en-GB')}</span>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                All physical perimeter check-ins are cryptographically logged with GPS verification.
              </span>
              <button
                onClick={() => setSelectedSite(null)}
                className="px-6 py-2.5 bg-[#032031] hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs ml-auto"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SecureSites;
