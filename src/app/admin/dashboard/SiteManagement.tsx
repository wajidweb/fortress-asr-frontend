'use client';

import React, { useState, useEffect } from 'react';
import { adminService, AdminSite } from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Building2, 
  MapPin, 
  Compass, 
  Users, 
  Search, 
  Edit3, 
  Eye, 
  Phone, 
  Check, 
  X, 
  ShieldCheck, 
  Clock, 
  Layers,
  FileText
} from 'lucide-react';

interface SiteManagementProps {
  onNavigateToRequests?: () => void;
}

export const SiteManagement: React.FC<SiteManagementProps> = ({ onNavigateToRequests }) => {
  const addToast = useUIStore((state) => state.addToast);

  const [sites, setSites] = useState<AdminSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected site for edit modal
  const [editingSite, setEditingSite] = useState<AdminSite | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    latitude: 51.5074,
    longitude: -0.1278,
    geofenceRadiusMeters: 100,
    siteInstructions: '',
    emergencyContact: '',
  });
  const [saving, setSaving] = useState(false);

  const loadSites = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllSites();
      setSites(res.sites || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to retrieve active properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleOpenEdit = (site: AdminSite) => {
    setEditingSite(site);
    setEditForm({
      name: site.name,
      address: site.address,
      latitude: Number(site.latitude),
      longitude: Number(site.longitude),
      geofenceRadiusMeters: site.geofenceRadiusMeters || 100,
      siteInstructions: site.siteInstructions || '',
      emergencyContact: site.emergencyContact || '',
    });
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
      });

      addToast(`Site "${editForm.name}" updated successfully`, 'success');
      setEditingSite(null);
      await loadSites();
    } catch (err: any) {
      addToast(err.message || 'Failed to update site', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredSites = sites.filter((site) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      site.name.toLowerCase().includes(q) ||
      site.address.toLowerCase().includes(q) ||
      site.client.companyName.toLowerCase().includes(q)
    );
  });

  const totalActiveOfficers = sites.reduce((sum, s) => sum + s.activeOfficersCount, 0);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Top Banner */}
      <div className="w-full bg-white border border-black rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Infrastructure & Properties</span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/30" />
            <span className="text-[10px] font-bold text-black/50">Geofence Registry</span>
          </div>
          <h1 className="text-2xl font-black text-[#032031] tracking-tight">Monitored Property Management</h1>
          <p className="text-xs text-black/70 font-semibold leading-relaxed">
            Manage physical client properties, circular GPS geofences, and site instructions. Guards assigned to these sites are strictly geofence-validated upon camera check-in.
          </p>
        </div>

        {onNavigateToRequests && (
          <button
            onClick={onNavigateToRequests}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#032031] hover:bg-black text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition shadow-sm shrink-0 cursor-pointer"
          >
            Review Deployment Queue
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black rounded-xl p-4 flex flex-col gap-1 shadow-xs">
          <span className="text-[9px] font-black uppercase tracking-wider text-black/50">Active Properties</span>
          <span className="text-2xl font-black text-[#032031]">{sites.length}</span>
        </div>
        <div className="bg-white border border-emerald-300 rounded-xl p-4 flex flex-col gap-1 shadow-xs bg-emerald-50/20">
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Officers On Duty Now</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-emerald-700">{totalActiveOfficers}</span>
            {totalActiveOfficers > 0 && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
        </div>
        <div className="bg-white border border-blue-300 rounded-xl p-4 flex flex-col gap-1 shadow-xs bg-blue-50/20">
          <span className="text-[9px] font-black uppercase tracking-wider text-blue-700">Perimeter Status</span>
          <span className="text-2xl font-black text-blue-700">Active & Calibrated</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-black rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by property, address, or client..."
            className="w-full pl-8 pr-3 py-1.5 border border-black/30 rounded-lg text-xs font-medium focus:outline-none focus:border-black bg-white"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/40" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
          Showing {filteredSites.length} of {sites.length} Provisioned {sites.length === 1 ? 'Site' : 'Sites'}
        </span>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white border border-black rounded-xl shadow-xs">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Loading properties registry...</span>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center px-4 gap-3 bg-white border border-black rounded-xl shadow-xs">
          <Building2 className="w-10 h-10 text-black/20" />
          <h3 className="text-sm font-black text-black uppercase tracking-wider">No properties found</h3>
          <p className="text-xs text-black/60 max-w-md font-medium">
            {searchQuery 
              ? 'No properties matched your search filter.'
              : 'No client properties have been provisioned yet. Approve incoming site requests to deploy sites.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSites.map((site) => (
            <div 
              key={site.id} 
              className="bg-white border border-black rounded-xl p-5 flex flex-col justify-between gap-5 shadow-xs hover:border-black hover:shadow-md transition group"
            >
              
              {/* Header */}
              <div className="flex flex-col gap-3">
                
                {/* Client Badge & Geofence Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/5 text-[#032031] border border-black/10 truncate max-w-[170px]">
                    <Building2 className="w-3 h-3 text-black/50 shrink-0" />
                    <span className="truncate">{site.client.companyName}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    <Compass className="w-3 h-3 text-blue-600" />
                    {site.geofenceRadiusMeters || 100}m
                  </span>
                </div>

                {/* Property Name */}
                <h3 className="font-black text-[#032031] text-sm leading-tight line-clamp-1">{site.name}</h3>

                {/* Address */}
                <div className="flex items-start gap-1.5 text-black/70 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-black/40 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-snug">{site.address}</span>
                </div>

                {/* Centerpoint coordinates */}
                <div className="px-2.5 py-1.5 bg-black/[0.03] border border-black/10 rounded-md flex items-center justify-between text-[10px] font-mono font-bold text-black/70">
                  <span>GPS: {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}</span>
                  <span className="text-[8px] font-black font-jakarta uppercase tracking-wider text-emerald-700">Active</span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-black/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${site.activeOfficersCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-black/30'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/80">
                    {site.activeOfficersCount > 0 ? `${site.activeOfficersCount} On Duty` : '0 Active'}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenEdit(site)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/5 hover:bg-[#032031] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit Geofence
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#032031]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-[#032031]">
                  Edit Property & Geofence
                </h3>
              </div>
              <button
                onClick={() => setEditingSite(null)}
                className="p-1 rounded-lg border border-black/20 hover:bg-black/5 text-black transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-5 text-xs">
              
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/50 border-b border-black/10 pb-1">
                  1. Identification & Address
                </span>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#032031]">Property Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="p-2 border border-black/30 rounded-lg focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#032031]">Physical Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="p-2 border border-black/30 rounded-lg focus:outline-none focus:border-black font-medium resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/50 border-b border-black/10 pb-1">
                  2. Geofence Centerpoint & Threshold
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#032031]">Latitude *</label>
                    <input
                      type="number"
                      step="0.000001"
                      min="-90"
                      max="90"
                      required
                      value={editForm.latitude}
                      onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) || 0 })}
                      className="p-2 border border-black/30 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#032031]">Longitude *</label>
                    <input
                      type="number"
                      step="0.000001"
                      min="-180"
                      max="180"
                      required
                      value={editForm.longitude}
                      onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) || 0 })}
                      className="p-2 border border-black/30 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#032031]">Geofence Radius (Meters) *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 150, 200].map((radius) => (
                      <button
                        type="button"
                        key={radius}
                        onClick={() => setEditForm({ ...editForm, geofenceRadiusMeters: radius })}
                        className={`py-2 px-3 rounded-lg border text-xs font-black transition cursor-pointer text-center
                          ${editForm.geofenceRadiusMeters === radius
                            ? 'bg-[#032031] text-white border-[#032031]'
                            : 'bg-white text-black border-black/30 hover:border-black'
                          }
                        `}
                      >
                        {radius}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/50 border-b border-black/10 pb-1">
                  3. Emergency Contact & Standing Orders
                </span>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#032031]">Emergency Contact</label>
                  <input
                    type="text"
                    value={editForm.emergencyContact}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                    className="p-2 border border-black/30 rounded-lg font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#032031]">Site Standing Orders</label>
                  <textarea
                    rows={2}
                    value={editForm.siteInstructions}
                    onChange={(e) => setEditForm({ ...editForm, siteInstructions: e.target.value })}
                    className="p-2 border border-black/30 rounded-lg font-medium resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="px-4 py-2 border border-black/30 rounded-lg font-bold hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#032031] hover:bg-black text-white font-black uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <LoaderRectangle />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default SiteManagement;
