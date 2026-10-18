'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminService, ClientManagementProfile } from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore, hasPermission } from '@/store/useAuthStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { ContractsSection } from './ContractsSection';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Ban, 
  UserCheck, 
  ExternalLink,
  Layers,
  Calendar,
  AlertCircle,
  Globe,
  Eye,
  X,
  User,
  DollarSign,
  Shield,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  RotateCw
} from 'lucide-react';

export const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<ClientManagementProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & stats
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    pendingApproval: 0,
    active: 0,
    suspended: 0,
  });
  
  // Selected client for Modal popup
  const [selectedClient, setSelectedClient] = useState<ClientManagementProfile | null>(null);

  // Tabs: 'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED'
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const addToast = useUIStore((state) => state.addToast);
  const currentUser = useAuthStore((state) => state.user);
  const canApprove = hasPermission(currentUser, 'clients:approve');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedClient(null);
      }
    };
    if (selectedClient) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClient]);

  // Load clients based on active tab, search, and pagination
  const loadClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getClients({
        status: activeTab === 'ALL' ? undefined : activeTab,
        search: searchQuery.trim() || undefined,
        page,
        limit,
      });

      setClients(res.clients || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
      if (res.stats) {
        setStats(res.stats);
      }

      // If a client is open in modal, update its snapshot
      if (selectedClient) {
        const updatedSelected = (res.clients || []).find(
          (c) => c.id === selectedClient.id || c.userId === selectedClient.userId
        );
        if (updatedSelected) {
          setSelectedClient(updatedSelected);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch corporate client accounts.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, page, limit, selectedClient, addToast]);

  useEffect(() => {
    loadClients();
  }, [activeTab, page, limit]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadClients();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadClients();
      addToast('Corporate client records refreshed with latest updates', 'success');
    } catch {
      // loadClients handles error toast
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');
    try {
      await adminService.approveClient(id);
      const msg = `Client "${name || 'Partner'}" successfully approved and marked as ACTIVE.`;
      setSuccess(msg);
      addToast(msg, 'success');
      await loadClients();
    } catch (err: any) {
      const msg = err.message || 'Failed to approve client account.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');
    try {
      await adminService.rejectClient(id);
      const msg = `Client "${name || 'Partner'}" successfully suspended.`;
      setSuccess(msg);
      addToast(msg, 'info');
      await loadClients();
    } catch (err: any) {
      const msg = err.message || 'Failed to suspend client account.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Active client accounts list from backend pagination
  const filteredClients = clients;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-black font-jakarta pb-16 select-none relative">
      
      {/* Top Banners */}
      {success && (
        <div className="w-full bg-black text-white p-4 rounded-xl border border-black flex items-center gap-3 animate-fade-in shadow-xs">
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-wider">Account Action Applied</p>
            <p className="text-[10px] text-white/80 font-medium">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 animate-fade-in shadow-xs">
          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-wider text-red-900">Operation Error</p>
            <p className="text-[10px] text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full bg-white border border-black rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
        
        {/* Header Block */}
        <div className="w-full border-b border-black/20 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-black">
              Fortress ASR Security Systems • Headquarters Operations
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
              Client Management & Corporate Accounts
            </h1>
            <p className="text-xs text-black/70 font-bold">
              Review new registration applications, approve contract partners, and click any client to view their full verified profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-black hover:bg-black/5 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh corporate client records"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <span className="px-3 py-1.5 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Total Accounts: {pagination.total}</span>
            </span>
          </div>
        </div>

        {/* Tab Bar & Search Row */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-black/20 pb-4">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('ALL');
                setPage(1);
              }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'ALL' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>All Corporate Clients</span>
              {stats.total > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${activeTab === 'ALL' ? 'bg-white text-black' : 'bg-black/10 text-black'}`}>
                  {stats.total}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('PENDING_APPROVAL');
                setPage(1);
              }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'PENDING_APPROVAL' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>New Registrations (Pending)</span>
              {stats.pendingApproval > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-500 text-white">
                  {stats.pendingApproval}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('ACTIVE');
                setPage(1);
              }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'ACTIVE' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approved Clients</span>
              {stats.active > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${activeTab === 'ACTIVE' ? 'bg-white text-black' : 'bg-black/10 text-black'}`}>
                  {stats.active}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('SUSPENDED');
                setPage(1);
              }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'SUSPENDED' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Suspended</span>
              {stats.suspended > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${activeTab === 'SUSPENDED' ? 'bg-white text-black' : 'bg-black/10 text-black'}`}>
                  {stats.suspended}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, contact, or email..."
              className="w-full pl-10 pr-4 py-2 border border-black rounded-lg text-xs font-bold text-black bg-white focus:outline-none focus:ring-1 focus:ring-black placeholder:text-black/40 transition"
            />
          </div>

        </div>

        {/* Content Section */}
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center p-20 text-black select-none text-[10px] font-black uppercase tracking-wider min-h-[350px] gap-4">
            <LoaderRectangle />
            <span>Loading Corporate Client Accounts...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="w-full border border-dashed border-black/40 rounded-xl p-14 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black/5 border border-black flex items-center justify-center text-black">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black">No Clients Found</h3>
            <p className="text-xs text-black/60 font-semibold max-w-md">
              There are currently no corporate accounts matching the selected category ({activeTab.replace('_', ' ')}) or search query.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {filteredClients.map((client) => {
              const displayName = client.companyName || `${client.user?.firstName || ''} ${client.user?.lastName || ''}`.trim() || 'Pending Registration';
              const repName = `${client.user?.firstName || ''} ${client.user?.lastName || ''}`.trim();
              const isActionLoading = actionLoadingId === client.id || actionLoadingId === client.userId;

              return (
                <div 
                  key={client.id}
                  className="w-full border border-black rounded-xl p-5 sm:p-6 bg-white hover:shadow-xs transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
                >
                  
                  {/* Left: Avatar & Organization Info - Clickable to open modal */}
                  <div 
                    onClick={() => setSelectedClient(client)}
                    className="flex items-start sm:items-center gap-5 sm:gap-6 w-full lg:w-auto cursor-pointer flex-grow"
                    title="Click to view full client details"
                  >
                    
                    {/* Client Logo Avatar with right-side spacing */}
                    <div className="w-16 h-16 rounded-xl bg-black/5 border border-black flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner group-hover:scale-105 transition mr-2 sm:mr-3">
                      {client.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getFullImageUrl(client.logoUrl)} 
                          alt={displayName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-black" />
                      )}
                    </div>

                    {/* Metadata & Details */}
                    <div className="flex flex-col gap-1 min-w-0">
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-black text-black tracking-tight uppercase truncate group-hover:underline">
                          {displayName}
                        </h2>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          client.status === 'ACTIVE' 
                            ? 'bg-black text-white' 
                            : client.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-900 border border-amber-400'
                            : 'bg-red-600 text-white'
                        }`}>
                          {client.status === 'ACTIVE' 
                            ? 'Active Partner' 
                            : client.status === 'PENDING_APPROVAL'
                            ? 'Pending Approval'
                            : 'Suspended'}
                        </span>

                        {client.urlSlug && (
                          <span className="px-2 py-0.5 border border-black rounded text-[8px] font-bold text-black uppercase tracking-wider flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" /> /{client.urlSlug}
                          </span>
                        )}
                      </div>

                      {/* Contact & Rep Line */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/80 font-semibold mt-0.5">
                        {client.user?.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-black" />
                            <span>{client.user.email}</span>
                          </span>
                        )}

                        {(client.contactPhone || client.user?.phoneNumber) && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-black" />
                            <span>{client.contactPhone || client.user?.phoneNumber}</span>
                          </span>
                        )}

                        {repName && (
                          <span className="text-[11px] text-black/60 font-bold">
                            Rep: <strong className="text-black font-black">{repName}</strong>
                          </span>
                        )}
                      </div>

                      {/* Location & Sites Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-black/70 font-medium mt-1">
                        {client.billingAddress && (
                          <span className="flex items-center gap-1.5 truncate max-w-md" title={client.billingAddress}>
                            <MapPin className="w-3 h-3 text-black shrink-0" />
                            <span className="truncate">{client.billingAddress}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black">
                          <Layers className="w-3 h-3" />
                          <span>{client.sitesCount} {client.sitesCount === 1 ? 'Monitored Site' : 'Monitored Sites'}</span>
                        </span>

                        <span className="flex items-center gap-1 text-[10px] text-black/60 font-bold">
                          <Calendar className="w-3 h-3" />
                          <span>Since: {formatDate(client.createdAt)}</span>
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-black/10 shrink-0">
                    
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="px-3.5 py-2.5 border border-black hover:bg-black/5 text-black rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                      title="View full client details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {canApprove ? (
                      <>
                        {client.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleApprove(client.id, displayName)}
                            disabled={isActionLoading}
                            className="px-4 py-2.5 bg-black hover:bg-black/85 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{isActionLoading ? 'Processing...' : 'Approve'}</span>
                          </button>
                        )}

                        {client.status !== 'SUSPENDED' && (
                          <button
                            onClick={() => handleReject(client.id, displayName)}
                            disabled={isActionLoading}
                            className="px-4 py-2.5 border border-black hover:bg-black hover:text-white text-black rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{isActionLoading ? 'Processing...' : 'Suspend'}</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="px-3 py-2 bg-black/5 text-black/60 rounded-lg text-[9px] font-black uppercase tracking-wider border border-black/10 select-none">
                        Read-Only
                      </span>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Proper Responsive Pagination Bar */}
        {!loading && clients.length > 0 && (
          <div className="pt-4 border-t border-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs font-bold">
            
            {/* Entries Indicator & Rows selector */}
            <div className="flex items-center gap-3">
              <span className="text-black/60 font-semibold text-[11px]">
                Showing {pagination.total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} accounts
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-black/50 uppercase">Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-0.5 border border-black/30 rounded text-xs font-bold bg-white focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-black/30 hover:border-black hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4 text-black" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-black/40 font-bold">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-md text-xs font-black transition cursor-pointer
                        ${page === p
                          ? 'bg-black text-white shadow-xs'
                          : 'border border-black/25 hover:border-black hover:bg-black/5 text-black'
                        }
                      `}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded-md border border-black/30 hover:border-black hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Full Details Modal Dialog - Google UI Redesign with Brand Palette */}
      {selectedClient && (() => {
        const repName = selectedClient.user?.firstName || selectedClient.user?.lastName 
          ? `${selectedClient.user.firstName || ''} ${selectedClient.user.lastName || ''}`.trim() 
          : 'Not Provided';
        const isActionLoading = actionLoadingId === selectedClient.id || actionLoadingId === selectedClient.userId;

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/65 backdrop-blur-xs animate-fade-in"
            onClick={() => setSelectedClient(null)}
          >
            <div 
              className="w-full max-w-5xl xl:max-w-6xl bg-white border border-black/15 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Top Title Bar (Google Workspace / Cloud Console style) */}
              <div className="px-5 sm:px-7 py-4 border-b border-black/10 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#032031] text-white flex items-center justify-center shadow-xs shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-[#032031] tracking-tight">
                        Corporate Client Profile & Account Dossier
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#032031]/10 text-[#032031]">
                        Corporate Entity
                      </span>
                    </div>
                    <p className="text-[11px] text-black/55 font-medium">
                      Official corporate account registration, billing rates & operational monitored properties audit
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedClient(null)}
                  className="w-9 h-9 rounded-xl border border-black/10 hover:border-black/30 hover:bg-black/5 text-black/60 hover:text-black flex items-center justify-center transition cursor-pointer"
                  title="Close dossier (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-6 bg-zinc-50/60 select-text">
                
                {/* 1. Hero Organization Identity Card */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
                    
                    {/* Organization Logo / Avatar */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-100 border border-black/15 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                      {selectedClient.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getFullImageUrl(selectedClient.logoUrl)}
                          alt={selectedClient.companyName || 'Corporate Client'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#032031] to-black text-white flex items-center justify-center font-black text-2xl tracking-wider">
                          {selectedClient.companyName?.[0]?.toUpperCase() || 'C'}
                        </div>
                      )}
                    </div>

                    {/* Metadata & Details */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-[#032031] tracking-tight">
                          {selectedClient.companyName || 'Pending Registration'}
                        </h2>

                        {/* Status Chip */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          selectedClient.status === 'ACTIVE'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                            : selectedClient.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-50 border border-amber-200 text-amber-900'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedClient.status === 'ACTIVE' ? 'bg-emerald-600 animate-pulse' : selectedClient.status === 'PENDING_APPROVAL' ? 'bg-amber-500' : 'bg-red-600'
                          }`} />
                          {selectedClient.status === 'ACTIVE'
                            ? 'Active Corporate Partner'
                            : selectedClient.status === 'PENDING_APPROVAL'
                            ? 'Pending Approval'
                            : 'Suspended Account'}
                        </span>
                      </div>

                      {/* URL Slug & Contact Badges */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-black/60 font-medium">
                        {selectedClient.urlSlug && (
                          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#032031] font-bold">
                            <Globe className="w-3.5 h-3.5 text-[#032031]/70" />
                            <span>/client/{selectedClient.urlSlug}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-black/80">
                          <Mail className="w-3.5 h-3.5 text-[#032031]/70" />
                          <span>{selectedClient.user?.email || 'N/A'}</span>
                        </span>
                        {(selectedClient.user?.phoneNumber || selectedClient.contactPhone) && (
                          <span className="flex items-center gap-1.5 font-mono text-[11px] text-black/80">
                            <Phone className="w-3.5 h-3.5 text-[#032031]/70" />
                            <span>{selectedClient.user?.phoneNumber || selectedClient.contactPhone}</span>
                          </span>
                        )}
                      </div>

                      {/* Quick Chips Row */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#032031]/5 border border-[#032031]/15 text-[#032031] text-[10px] font-black">
                          <DollarSign className="w-3.5 h-3.5 text-[#032031]" />
                          Billing: £{selectedClient.billingRateHour || '0.00'} / hour
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[10px] font-black">
                          <Layers className="w-3.5 h-3.5 text-blue-700" />
                          {selectedClient.sites.length} Monitored {selectedClient.sites.length === 1 ? 'Site' : 'Sites'}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 text-black/70 text-[10px] font-bold">
                          <Calendar className="w-3.5 h-3.5 text-black/50" />
                          Partner Since: {formatDate(selectedClient.createdAt)}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Right Header Status / IDs */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-black/10 gap-2 shrink-0">
                    <div className="flex flex-col lg:items-end text-left lg:text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Account Verification</span>
                      <span className={`text-xs font-black ${selectedClient.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {selectedClient.status === 'ACTIVE' ? 'Verified Corporate Partner' : 'Awaiting Operational Clearance'}
                      </span>
                    </div>

                    <div className="text-[10px] text-black/50 font-mono">
                      ID: {selectedClient.id.slice(0, 16)}...
                    </div>
                  </div>
                </div>

                {/* 2. Google-Style Metric Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  
                  {/* Card 1: Account Status */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Partner Authorization</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#032031]">
                        {selectedClient.status === 'ACTIVE' ? 'Active Account' : (selectedClient.status === 'PENDING_APPROVAL' ? 'Pending Approval' : 'Suspended')}
                      </span>
                      <ShieldCheck className={`w-4 h-4 ${selectedClient.status === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-500'}`} />
                    </div>
                    <span className="text-[10px] text-black/60 font-semibold truncate">
                      {selectedClient.user?.isActive ? 'Login & Dispatch Active' : 'Access Restricted'}
                    </span>
                  </div>

                  {/* Card 2: Monitored Sites */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Monitored Locations</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#032031]">
                        {selectedClient.sites.length} Active {selectedClient.sites.length === 1 ? 'Property' : 'Properties'}
                      </span>
                      <Layers className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-black/60 font-semibold truncate">
                      Assigned physical security sites
                    </span>
                  </div>

                  {/* Card 3: Hourly Billing Rate */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Contract Billing Rate</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#032031]">
                        £{selectedClient.billingRateHour || '0.00'} / hr
                      </span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] text-black/60 font-semibold">Standard service hourly rate</span>
                  </div>

                  {/* Card 4: Portal Security */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Portal Authentication</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#032031]">
                        {selectedClient.user?.isEmailVerified ? 'Email Verified' : 'Unverified Email'}
                      </span>
                      <CheckCircle2 className={`w-4 h-4 ${selectedClient.user?.isEmailVerified ? 'text-emerald-600' : 'text-amber-500'}`} />
                    </div>
                    <span className="text-[10px] text-black/60 font-semibold">
                      Client portal access status
                    </span>
                  </div>

                </div>

                {/* 3. Detailed Audit Dossier Grid (2-column layout on Desktop) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Left Column: Authorized Representative & Billing */}
                  <div className="flex flex-col gap-5">
                    
                    {/* Primary Account Representative Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-black/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#032031]/10 text-[#032031] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#032031]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                              Primary Account Representative
                            </h4>
                            <p className="text-[10px] text-black/50 font-medium">Authorized contract manager & account liaison</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#032031]/10 text-[#032031]">
                          {selectedClient.user?.role || 'CLIENT'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Representative Legal Name</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {repName}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Account Email Address</span>
                          <span className="font-mono font-bold text-xs text-[#032031] truncate">
                            {selectedClient.user?.email || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Direct Contact Phone</span>
                          <span className="font-mono font-bold text-xs text-[#032031]">
                            {selectedClient.user?.phoneNumber || selectedClient.contactPhone || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Portal Login State</span>
                          <span className="font-bold text-xs text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{selectedClient.user?.isActive ? 'Active Login Enabled' : 'Access Suspended'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Corporate Entity & Invoicing Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-black/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                              Corporate Entity & Invoicing
                            </h4>
                            <p className="text-[10px] text-black/50 font-medium">Registered business entity & contract terms</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Invoice Profile
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Corporate Entity Name</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {selectedClient.companyName || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Agreed Hourly Rate</span>
                          <span className="font-mono font-bold text-xs text-[#032031]">
                            £{selectedClient.billingRateHour || '0.00'} / hour
                          </span>
                        </div>

                        <div className="p-3.5 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1 sm:col-span-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#032031]/60" />
                            Corporate Billing Location & Address
                          </span>
                          <span className="font-medium text-xs text-[#032031] whitespace-pre-wrap leading-relaxed">
                            {selectedClient.billingAddress || 'No billing address recorded for this corporate account.'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Sites, Operational Contacts & Audit */}
                  <div className="flex flex-col gap-5">
                    
                    {/* Site Operations & Monitored Properties Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-black/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-blue-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                              Assigned Monitored Sites
                            </h4>
                            <p className="text-[10px] text-black/50 font-medium">Physical properties receiving security coverage</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
                          {selectedClient.sites.length} Active {selectedClient.sites.length === 1 ? 'Site' : 'Sites'}
                        </span>
                      </div>

                      {/* Site Contacts */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Designated Site Contact</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {selectedClient.contactPerson || 'Not Assigned'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Site Telephone</span>
                          <span className="font-mono font-bold text-xs text-[#032031]">
                            {selectedClient.contactPhone || 'Not Assigned'}
                          </span>
                        </div>
                      </div>

                      {/* Monitored Properties List */}
                      <div className="p-4 bg-zinc-50 border border-black/10 rounded-xl flex flex-col gap-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
                          Monitored Physical Facilities
                        </span>

                        {selectedClient.sites.length === 0 ? (
                          <div className="p-3 bg-white border border-black/10 rounded-xl text-xs text-black/60 font-semibold italic text-center">
                            No monitored physical sites are currently provisioned for this client.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {selectedClient.sites.map((site) => (
                              <div
                                key={site.id}
                                className="p-3 bg-white border border-black/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-[#032031]/5 border border-[#032031]/15 text-[#032031] flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 text-[#032031]" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-black text-xs text-[#032031] truncate">
                                      {site.name}
                                    </span>
                                    {site.address && (
                                      <span className="text-[11px] text-black/60 truncate flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-black/40 shrink-0" />
                                        {site.address}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                                  Active Site
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Signed Contracts & Service Agreements Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <ContractsSection
                        clientId={selectedClient.id}
                        entityName={selectedClient.companyName || 'Client'}
                      />
                    </div>

                    {/* Immutable Audit Trail & System Records Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center gap-2.5 border-b border-black/10 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-[#032031] flex items-center justify-center">
                          <Clock className="w-4 h-4 text-[#032031]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                            Compliance Audit Trail & Identifiers
                          </h4>
                          <p className="text-[10px] text-black/50 font-medium">System immutable account timestamps & UUID tracking</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Account Opened Date</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {formatDateTime(selectedClient.createdAt)}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Last Profile Update</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {formatDateTime(selectedClient.updatedAt)}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">User Account ID</span>
                          <span className="font-mono text-[10px] text-black/75 truncate select-all">
                            {selectedClient.userId}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Client Profile Record ID</span>
                          <span className="font-mono text-[10px] text-black/75 truncate select-all">
                            {selectedClient.id}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Modal Bottom Actions Bar */}
              <div className="px-5 sm:px-7 py-4 border-t border-black/10 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-black/60 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#032031]" />
                  <span>SOMS official corporate partner & monitored properties record</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {canApprove && selectedClient.status !== 'ACTIVE' && (
                    <button
                      onClick={async () => {
                        await handleApprove(selectedClient.id, selectedClient.companyName);
                      }}
                      disabled={isActionLoading}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#032031] hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isActionLoading ? 'Processing...' : 'Approve Client Account'}</span>
                    </button>
                  )}

                  {canApprove && selectedClient.status !== 'SUSPENDED' && (
                    <button
                      onClick={async () => {
                        await handleReject(selectedClient.id, selectedClient.companyName);
                      }}
                      disabled={isActionLoading}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 hover:border-red-600 text-red-600 hover:bg-red-50 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4" />
                      <span>{isActionLoading ? 'Processing...' : 'Suspend Account'}</span>
                    </button>
                  )}

                  {!canApprove && (
                    <span className="px-3 py-2 bg-black/5 text-black/60 rounded-lg text-xs font-black uppercase tracking-wider border border-black/10 select-none">
                      Read-Only Audit Mode
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedClient(null)}
                    className="px-5 py-2.5 border border-black/20 hover:border-black text-black hover:bg-black/5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default ClientManagement;
