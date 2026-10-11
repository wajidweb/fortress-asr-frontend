'use client';

import React, { useState, useEffect } from 'react';
import { clientService, ClientSite } from '@/services/client.service';
import { useUIStore } from '@/store/useUIStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
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
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

interface SecureSitesProps {
  onNavigateToRequests: () => void;
}

export const SecureSites: React.FC<SecureSitesProps> = ({ onNavigateToRequests }) => {
  const addToast = useUIStore((state) => state.addToast);

  const [sites, setSites] = useState<ClientSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<ClientSite | null>(null);

  const loadSites = async () => {
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
  };

  useEffect(() => {
    loadSites();
  }, []);

  const filteredSites = sites.filter((site) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return site.name.toLowerCase().includes(q) || site.address.toLowerCase().includes(q);
  });

  const totalActiveOfficers = sites.reduce((sum, s) => sum + s.activeOfficersCount, 0);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Top Banner */}
      <div className="w-full bg-white border border-black rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Contracted Real Estate</span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/30" />
            <span className="text-[10px] font-bold text-black/50">Digital Geofence Perimeter</span>
          </div>
          <h1 className="text-2xl font-black text-[#032031] tracking-tight">Monitored Secure Sites</h1>
          <p className="text-xs text-black/70 font-semibold leading-relaxed">
            All physical properties actively managed by Fortress ASR. Every site features circular GPS geofencing ensuring officers must be physically present inside the designated radius before visual clock-in is validated.
          </p>
        </div>

        <button
          onClick={onNavigateToRequests}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#032031] hover:bg-black text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Request New Site Deployment
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black rounded-xl p-4 flex flex-col gap-1 shadow-xs">
          <span className="text-[9px] font-black uppercase tracking-wider text-black/50">Contracted Sites</span>
          <span className="text-2xl font-black text-[#032031]">{sites.length}</span>
        </div>
        <div className="bg-white border border-emerald-300 rounded-xl p-4 flex flex-col gap-1 shadow-xs bg-emerald-50/20">
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Officers On Duty Now</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-emerald-700">{totalActiveOfficers}</span>
            {totalActiveOfficers > 0 && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
        </div>
        <div className="bg-white border border-blue-300 rounded-xl p-4 flex flex-col gap-1 shadow-xs bg-blue-50/20">
          <span className="text-[9px] font-black uppercase tracking-wider text-blue-700">Perimeter Status</span>
          <span className="text-2xl font-black text-blue-700">100% Geofenced</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-black rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter properties by name or address..."
            className="w-full pl-8 pr-3 py-1.5 border border-black/30 rounded-lg text-xs font-medium focus:outline-none focus:border-black bg-white"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/40" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
          Showing {filteredSites.length} of {sites.length} Active {sites.length === 1 ? 'Site' : 'Sites'}
        </span>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white border border-black rounded-xl shadow-xs">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Loading contracted properties...</span>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center px-4 gap-4 bg-white border border-black rounded-xl shadow-xs">
          <Building2 className="w-12 h-12 text-black/20" />
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-base font-black text-black uppercase tracking-wider">No Monitored Sites Deployed</h3>
            <p className="text-xs text-black/60 font-medium leading-relaxed">
              {searchQuery
                ? 'No properties matched your search query.'
                : 'Your organization currently has no active property geofences provisioned. Submit a Site Service Request to begin security manning.'
              }
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={onNavigateToRequests}
              className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 bg-[#032031] text-white text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-black transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Request Site Deployment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSites.map((site) => (
            <div 
              key={site.id} 
              className="bg-white border border-black rounded-xl p-5 flex flex-col justify-between gap-5 shadow-xs hover:border-black hover:shadow-md transition group"
            >
              
              {/* Header & Geofence pill */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-black/5 rounded-lg border border-black/10 group-hover:bg-[#032031] group-hover:text-white transition">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col truncate">
                      <h3 className="font-black text-[#032031] text-sm truncate">{site.name}</h3>
                      <span className="text-[9px] font-black uppercase tracking-widest text-black/40">SOMS Verified Site</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    <Compass className="w-3 h-3 text-blue-600" />
                    {site.geofenceRadiusMeters || 100}m Geofence
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-1.5 text-black/70 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-black/40 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-snug">{site.address}</span>
                </div>

                {/* Coordinates capsule */}
                <div className="px-2.5 py-1.5 bg-black/[0.03] border border-black/10 rounded-md flex items-center justify-between text-[10px] font-mono font-bold text-black/70">
                  <span>GPS: {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}</span>
                  <span className="text-[8px] font-black font-jakarta uppercase tracking-wider text-black/40">Verified</span>
                </div>
              </div>

              {/* Status footer: On-Duty officers & Action */}
              <div className="pt-3 border-t border-black/10 flex items-center justify-between gap-2">
                
                {/* Active Officers */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${site.activeOfficersCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-black/30'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/80">
                    {site.activeOfficersCount > 0 
                      ? `${site.activeOfficersCount} On Duty Now` 
                      : 'No Active Shift'
                    }
                  </span>
                </div>

                <button
                  onClick={() => setSelectedSite(site)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/5 hover:bg-[#032031] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  Details
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* SITE INSPECTION MODAL */}
      {selectedSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-black/50">Property Details</span>
                <h3 className="text-sm font-black text-[#032031]">{selectedSite.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSite(null)}
                className="p-1 rounded-lg border border-black/20 hover:bg-black/5 text-black transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-5 text-xs">
              
              {/* Geofence specs banner */}
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-lg flex items-center justify-between text-blue-950">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-700">Enforced Geofence Radius</span>
                  <span className="text-base font-black">{selectedSite.geofenceRadiusMeters || 100} Meters</span>
                  <span className="text-[10px] text-blue-800">
                    Centerpoint: {Number(selectedSite.latitude).toFixed(6)}, {Number(selectedSite.longitude).toFixed(6)}
                  </span>
                </div>
                <div className="p-3 bg-blue-600 text-white rounded-lg shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
              </div>

              {/* Physical Address */}
              <div className="border border-black/10 rounded-lg p-3.5 flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-black/50">Physical Deployment Address</span>
                <span className="font-bold text-black">{selectedSite.address}</span>
              </div>

              {/* Officers Currently On Duty */}
              <div className="border border-black/10 rounded-lg p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-black/50">Officers Clocked In</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {selectedSite.activeOfficersCount} Active
                  </span>
                </div>

                {selectedSite.activeShifts && selectedSite.activeShifts.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedSite.activeShifts.map((shift) => (
                      <div key={shift.id} className="p-2.5 bg-black/[0.02] border border-black/10 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#032031] text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden relative">
                            {shift.guard.profilePictureUrl ? (
                              <img src={getFullImageUrl(shift.guard.profilePictureUrl)} alt="Officer" className="w-full h-full object-cover" />
                            ) : (
                              `${shift.guard.firstName?.[0] || 'G'}`
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#032031]">{shift.guard.firstName} {shift.guard.lastName}</span>
                            <span className="text-[10px] text-black/50">SIA Licensed Officer</span>
                          </div>
                        </div>

                        {shift.checkInTime && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-black/60">
                            <Clock className="w-3 h-3" />
                            Clocked In: {new Date(shift.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-black/50 italic">No officers currently clocked into this site.</span>
                )}
              </div>

              {/* Site instructions */}
              {selectedSite.siteInstructions && (
                <div className="border border-black/10 rounded-lg p-3.5 flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-black/50">Site Orders & Instructions</span>
                  <p className="font-semibold text-black/80 whitespace-pre-line leading-relaxed">
                    {selectedSite.siteInstructions}
                  </p>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedSite.emergencyContact && (
                <div className="border border-black/10 rounded-lg p-3.5 flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-black/50">Emergency Contact</span>
                  <span className="font-bold text-black flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-black/50" />
                    {selectedSite.emergencyContact}
                  </span>
                </div>
              )}

              {/* Metadata */}
              <div className="text-[9px] text-black/40 flex items-center justify-between pt-2 border-t border-black/10">
                <span>Site UUID: {selectedSite.id}</span>
                <span>Active Since: {new Date(selectedSite.createdAt).toLocaleDateString('en-GB')}</span>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/10 flex items-center justify-end bg-zinc-50/50">
              <button
                onClick={() => setSelectedSite(null)}
                className="px-4 py-1.5 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-black/80 transition cursor-pointer"
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

export default SecureSites;
