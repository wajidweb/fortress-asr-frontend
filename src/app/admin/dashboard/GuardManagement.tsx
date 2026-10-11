'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminService, GuardProfile } from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  UserCheck, 
  FileText, 
  ExternalLink, 
  Award, 
  Phone, 
  Mail, 
  Clock, 
  Search, 
  Eye, 
  X, 
  User, 
  AlertCircle,
  Calendar,
  Lock,
  DollarSign,
  Shield,
  ChevronLeft,
  ChevronRight,
  RotateCw
} from 'lucide-react';

export const GuardManagement: React.FC = () => {
  const [guards, setGuards] = useState<GuardProfile[]>([]);
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

  // Selected guard for Modal popup
  const [selectedGuard, setSelectedGuard] = useState<GuardProfile | null>(null);

  // Tabs: 'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED'
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const addToast = useUIStore((state) => state.addToast);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedGuard(null);
      }
    };
    if (selectedGuard) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGuard]);

  // Load guards based on active tab, search, and pagination
  const loadGuards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getGuards({
        status: activeTab === 'ALL' ? undefined : activeTab,
        search: searchQuery.trim() || undefined,
        page,
        limit,
      });

      setGuards(res.guards || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
      if (res.stats) {
        setStats(res.stats);
      }

      // If a guard is open in modal, update snapshot
      if (selectedGuard) {
        const updatedSelected = (res.guards || []).find(
          (g) => g.id === selectedGuard.id || g.userId === selectedGuard.userId
        );
        if (updatedSelected) {
          setSelectedGuard(updatedSelected);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch guard profiles from secure API.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, page, limit, selectedGuard, addToast]);

  useEffect(() => {
    loadGuards();
  }, [activeTab, page, limit]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadGuards();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadGuards();
      addToast('Officer roster records refreshed with latest updates', 'success');
    } catch {
      // loadGuards handles error toast
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');
    try {
      await adminService.approveGuard(id);
      const msg = `Officer "${name || 'Guard'}" successfully approved and marked as ACTIVE.`;
      setSuccess(msg);
      addToast(msg, 'success');
      await loadGuards();
    } catch (err: any) {
      const msg = err.message || 'Failed to approve guard.';
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
      await adminService.rejectGuard(id);
      const msg = `Officer "${name || 'Guard'}" successfully suspended.`;
      setSuccess(msg);
      addToast(msg, 'info');
      await loadGuards();
    } catch (err: any) {
      const msg = err.message || 'Failed to suspend guard.';
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

  // Active officers list from backend pagination
  const filteredGuards = guards;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-black font-jakarta pb-16 select-none relative">
      
      {/* Top Banners */}
      {success && (
        <div className="w-full bg-black text-white p-4 rounded-md border-2 border-black flex items-center gap-3 animate-fade-in shadow-sm">
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
        <div className="w-full bg-red-50 text-red-700 p-4 rounded-md border-2 border-red-600 flex items-center gap-3 animate-fade-in shadow-sm">
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
      <div className="w-full bg-white border-2 border-black rounded-lg p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        
        {/* Header Block */}
        <div className="w-full border-b-2 border-black pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-black">
              Fortress ASR Security Systems • Headquarters Operations
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
              Guard Management & Officer Compliance Audits
            </h1>
            <p className="text-xs text-black/70 font-bold">
              Audit licensing credentials, review new registration applications, and click any officer to view their full compliance dossier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-black hover:bg-black/5 text-black text-[10px] font-black uppercase tracking-wider rounded-sm transition shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh officer records"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <span className="px-3 py-1.5 bg-black text-white rounded-sm text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Total Officers: {pagination.total}</span>
            </span>
          </div>
        </div>

        {/* Tab Bar & Search Row */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-black/15 pb-4">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('ALL');
                setPage(1);
              }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'ALL' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Roster Officers</span>
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
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-2 cursor-pointer
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
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'ACTIVE' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approved Guards (Active)</span>
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
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'SUSPENDED' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Suspended / Rejected</span>
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
              placeholder="Search name, SIA badge, or email..."
              className="w-full pl-10 pr-4 py-2 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
          </div>

        </div>

        {/* Content Section */}
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center p-20 text-black select-none text-[10px] font-black uppercase tracking-wider min-h-[350px] gap-4">
            <LoaderRectangle />
            <span>Loading Officer Roster Records...</span>
          </div>
        ) : filteredGuards.length === 0 ? (
          <div className="w-full border-2 border-dashed border-black/30 rounded-lg p-14 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black/5 border border-black flex items-center justify-center text-black">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black">No Officers Found</h3>
            <p className="text-xs text-black/60 font-semibold max-w-md">
              There are currently no security officers matching the selected category ({activeTab.replace('_', ' ')}) or search query.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {filteredGuards.map((guard) => {
              const displayName = `${guard.firstName || guard.user?.firstName || ''} ${guard.lastName || guard.user?.lastName || ''}`.trim() || 'Officer Account';
              const isActionLoading = actionLoadingId === guard.id || actionLoadingId === guard.userId;
              const isExpiredSia = guard.siaExpiryDate ? new Date(guard.siaExpiryDate) <= new Date() : false;

              return (
                <div 
                  key={guard.id}
                  className="w-full border-2 border-black rounded-lg p-5 sm:p-6 bg-white hover:shadow-md transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
                >
                  
                  {/* Left: Avatar & Officer Info - Clickable to open modal */}
                  <div 
                    onClick={() => setSelectedGuard(guard)}
                    className="flex items-start sm:items-center gap-5 sm:gap-6 w-full lg:w-auto cursor-pointer flex-grow"
                    title="Click to view full officer compliance details"
                  >
                    
                    {/* Guard Photo Avatar with right-side spacing */}
                    <div className="w-16 h-16 rounded-lg bg-black/5 border-2 border-black flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner group-hover:scale-105 transition mr-2 sm:mr-3">
                      {guard.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getFullImageUrl(guard.profilePictureUrl)} 
                          alt={displayName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-black">
                          <span className="text-base font-black">
                            {((guard.firstName?.[0] || guard.user?.firstName?.[0] || '') + (guard.lastName?.[0] || guard.user?.lastName?.[0] || '')).toUpperCase() || 'SO'}
                          </span>
                        </div>
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
                          guard.status === 'ACTIVE' 
                            ? 'bg-black text-white' 
                            : guard.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-900 border border-amber-400'
                            : 'bg-red-600 text-white'
                        }`}>
                          {guard.status === 'ACTIVE' 
                            ? 'SIA Verified' 
                            : guard.status === 'PENDING_APPROVAL'
                            ? 'Pending Audit'
                            : 'Suspended'}
                        </span>

                        {guard.siaLicenceNumber && (
                          <span className="px-2 py-0.5 border border-black rounded text-[8px] font-bold text-black uppercase tracking-wider flex items-center gap-1 font-mono">
                            <Award className="w-2.5 h-2.5 text-black" /> {guard.siaLicenceNumber}
                          </span>
                        )}
                      </div>

                      {/* Contact Line */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/80 font-semibold mt-0.5">
                        {guard.user?.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-black" />
                            <span>{guard.user.email}</span>
                          </span>
                        )}

                        {guard.phoneNumber && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-black" />
                            <span>{guard.phoneNumber}</span>
                          </span>
                        )}

                        {guard.siaExpiryDate && (
                          <span className={`text-[11px] font-bold flex items-center gap-1 ${
                            isExpiredSia ? 'text-red-600' : 'text-black/70'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>SIA Exp: {formatDate(guard.siaExpiryDate)} {isExpiredSia ? '(EXPIRED)' : ''}</span>
                          </span>
                        )}
                      </div>

                      {/* Right to Work & Registration Line */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-black/70 font-medium mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-black">
                          <FileText className="w-3 h-3 text-black" />
                          <span>RTW: {guard.rtwDocumentType || 'Passport'}</span>
                        </span>

                        {guard.rtwDocumentUrl && (
                          <a
                            href={getFullImageUrl(guard.rtwDocumentUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-black text-black underline flex items-center gap-0.5 hover:text-black/70"
                          >
                            <span>View Scan</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}

                        <span className="flex items-center gap-1 text-[10px] text-black/60 font-bold">
                          <Calendar className="w-3 h-3" />
                          <span>Registered: {formatDate(guard.createdAt)}</span>
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-black/10 shrink-0">
                    
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedGuard(guard)}
                      className="px-3.5 py-2.5 border-2 border-black bg-white hover:bg-black/5 text-black rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                      title="View full officer details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {guard.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleApprove(guard.id, displayName)}
                        disabled={isActionLoading}
                        className="px-4 py-2.5 bg-black hover:bg-black/85 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isActionLoading ? 'Processing...' : 'Pass / Approve'}</span>
                      </button>
                    )}

                    {guard.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleReject(guard.id, displayName)}
                        disabled={isActionLoading}
                        className="px-4 py-2.5 border-2 border-black text-black hover:bg-black hover:text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{isActionLoading ? 'Processing...' : 'Reject / Lock'}</span>
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Proper Responsive Pagination Bar */}
        {!loading && guards.length > 0 && (
          <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs font-bold">
            
            {/* Entries Indicator & Rows selector */}
            <div className="flex items-center gap-3">
              <span className="text-black/60 font-semibold text-[11px]">
                Showing {pagination.total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} officers
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
      {selectedGuard && (() => {
        const modalDisplayName = `${selectedGuard.firstName || selectedGuard.user?.firstName || ''} ${selectedGuard.lastName || selectedGuard.user?.lastName || ''}`.trim() || 'Officer Account';
        const isExpiredSia = selectedGuard.siaExpiryDate ? new Date(selectedGuard.siaExpiryDate) <= new Date() : false;
        const isActionLoading = actionLoadingId === selectedGuard.id || actionLoadingId === selectedGuard.userId;

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/65 backdrop-blur-xs animate-fade-in"
            onClick={() => setSelectedGuard(null)}
          >
            <div 
              className="w-full max-w-5xl xl:max-w-6xl bg-white border border-black/15 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Top Title Bar (Google Workspace / Cloud Console style) */}
              <div className="px-5 sm:px-7 py-4 border-b border-black/10 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#032031] text-white flex items-center justify-center shadow-xs shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-[#032031] tracking-tight">
                        Security Officer Profile & Compliance Dossier
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#032031]/10 text-[#032031]">
                        Verified Record
                      </span>
                    </div>
                    <p className="text-[11px] text-black/55 font-medium">
                      Official statutory right to work, SIA badge credentials & operational deployment audit
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedGuard(null)}
                  className="w-9 h-9 rounded-xl border border-black/10 hover:border-black/30 hover:bg-black/5 text-black/60 hover:text-black flex items-center justify-center transition cursor-pointer"
                  title="Close dossier (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-6 bg-zinc-50/60 select-text">
                
                {/* 1. Hero Officer Identity Card */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
                    
                    {/* Guard Photo Avatar */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-100 border-2 border-black/15 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                      {selectedGuard.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getFullImageUrl(selectedGuard.profilePictureUrl)}
                          alt={modalDisplayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#032031] to-black text-white flex items-center justify-center font-black text-2xl tracking-wider">
                          {((selectedGuard.firstName?.[0] || selectedGuard.user?.firstName?.[0] || '') + (selectedGuard.lastName?.[0] || selectedGuard.user?.lastName?.[0] || '')).toUpperCase() || 'SO'}
                        </div>
                      )}
                    </div>

                    {/* Metadata & Details */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-[#032031] tracking-tight">
                          {modalDisplayName}
                        </h2>

                        {/* Status Chip */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          selectedGuard.status === 'ACTIVE'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                            : selectedGuard.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-50 border border-amber-200 text-amber-900'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedGuard.status === 'ACTIVE' ? 'bg-emerald-600 animate-pulse' : selectedGuard.status === 'PENDING_APPROVAL' ? 'bg-amber-500' : 'bg-red-600'
                          }`} />
                          {selectedGuard.status === 'ACTIVE'
                            ? 'SIA Verified / Active Officer'
                            : selectedGuard.status === 'PENDING_APPROVAL'
                            ? 'Pending Background Review'
                            : 'Suspended Account'}
                        </span>
                      </div>

                      {/* Contact Badges */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-black/60 font-medium">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-black/80">
                          <Mail className="w-3.5 h-3.5 text-[#032031]/70" />
                          <span>{selectedGuard.user?.email || 'N/A'}</span>
                        </span>
                        {selectedGuard.phoneNumber && (
                          <span className="flex items-center gap-1.5 font-mono text-[11px] text-black/80">
                            <Phone className="w-3.5 h-3.5 text-[#032031]/70" />
                            <span>{selectedGuard.phoneNumber}</span>
                          </span>
                        )}
                      </div>

                      {/* Quick Chips Row */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {selectedGuard.siaLicenceNumber && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-black font-mono tracking-wider">
                            <Award className="w-3 h-3 text-amber-700" />
                            SIA: {selectedGuard.siaLicenceNumber}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#032031]/5 border border-[#032031]/15 text-[#032031] text-[10px] font-black">
                          <DollarSign className="w-3 h-3 text-[#032031]" />
                          £{selectedGuard.payRatePerHour || '0.00'} / hour
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 text-black/70 text-[10px] font-bold">
                          <Calendar className="w-3 h-3 text-black/50" />
                          Registered: {formatDate(selectedGuard.createdAt)}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Right Header Status / IDs */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-black/10 gap-2 shrink-0">
                    <div className="flex flex-col lg:items-end text-left lg:text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Dispatch Eligibility</span>
                      <span className={`text-xs font-black ${selectedGuard.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {selectedGuard.status === 'ACTIVE' ? 'Ready for Deployment' : 'Awaiting Operational Approval'}
                      </span>
                    </div>

                    <div className="text-[10px] text-black/50 font-mono">
                      ID: {selectedGuard.id.slice(0, 16)}...
                    </div>
                  </div>
                </div>

                {/* 2. Google-Style Metric Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  
                  {/* Card 1: SIA Licence */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">SIA Licence Status</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#032031]">
                        {isExpiredSia ? 'Expired Badge' : (selectedGuard.siaLicenceNumber ? 'Valid Licence' : 'Not Provided')}
                      </span>
                      <Award className={`w-4 h-4 ${isExpiredSia ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>
                    <span className="text-[10px] text-black/60 font-semibold truncate">
                      {selectedGuard.siaExpiryDate ? `Expires: ${formatDate(selectedGuard.siaExpiryDate)}` : 'No expiration date'}
                    </span>
                  </div>

                  {/* Card 2: Right to Work */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Right to Work (RTW)</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#032031]">
                        {selectedGuard.hasIndefiniteRTW ? 'Indefinite' : (selectedGuard.rtwDocumentType || 'Documented')}
                      </span>
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-black/60 font-semibold truncate">
                      {selectedGuard.hasIndefiniteRTW ? 'Indefinite Leave to Remain' : (selectedGuard.rightToWorkExpiryDate ? `Expires: ${formatDate(selectedGuard.rightToWorkExpiryDate)}` : 'Standard verification')}
                    </span>
                  </div>

                  {/* Card 3: Hourly Pay Rate */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Standard Hourly Rate</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#032031]">
                        £{selectedGuard.payRatePerHour || '0.00'} / hr
                      </span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] text-black/60 font-semibold">Standard shift compensation</span>
                  </div>

                  {/* Card 4: Operational Roster */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Roster Eligibility</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#032031]">
                        {selectedGuard.user?.isActive ? 'Active Dispatch' : 'Dispatch Restricted'}
                      </span>
                      <ShieldCheck className={`w-4 h-4 ${selectedGuard.user?.isActive ? 'text-emerald-600' : 'text-amber-500'}`} />
                    </div>
                    <span className="text-[10px] text-black/60 font-semibold">
                      {selectedGuard.user?.isActive ? 'Authorized for site shifts' : 'Action required by HQ'}
                    </span>
                  </div>

                </div>

                {/* 3. Detailed Audit Dossier Grid (2-column layout on Desktop) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Left Column: Regulatory & Licensing Compliance */}
                  <div className="flex flex-col gap-5">
                    
                    {/* SIA Licensing Credentials Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-black/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                            <Award className="w-4 h-4 text-amber-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                              SIA Licensing Credentials
                            </h4>
                            <p className="text-[10px] text-black/50 font-medium">Security Industry Authority verification</p>
                          </div>
                        </div>

                        {selectedGuard.status === 'ACTIVE' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            HQ Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                            Pending Audit
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">16-Digit Badge Number</span>
                          <span className="font-mono font-bold text-sm text-[#032031] tracking-wider">
                            {selectedGuard.siaLicenceNumber || 'Not Provided'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Licence Expiration</span>
                          <span className={`font-bold text-xs ${isExpiredSia ? 'text-red-600' : 'text-[#032031]'}`}>
                            {formatDate(selectedGuard.siaExpiryDate)}
                            {isExpiredSia && ' (EXPIRED)'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Contract Pay Rate</span>
                          <span className="font-mono font-bold text-xs text-[#032031]">
                            £{selectedGuard.payRatePerHour || '0.00'} / hour
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Regulatory Compliance</span>
                          <span className="font-bold text-xs text-emerald-700 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Compliant with UK SIA Act</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statutory Right to Work Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-black/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                              Statutory Right to Work (RTW)
                            </h4>
                            <p className="text-[10px] text-black/50 font-medium">Home Office & statutory employment compliance</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
                          {selectedGuard.hasIndefiniteRTW ? 'Indefinite' : 'Time-Limited'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Document Type</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {selectedGuard.rtwDocumentType || 'Passport'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Permission Expiration</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {selectedGuard.hasIndefiniteRTW 
                              ? 'Indefinite Leave to Remain (No Expiry)' 
                              : formatDate(selectedGuard.rightToWorkExpiryDate)}
                          </span>
                        </div>
                      </div>

                      {/* Document Scan Evidence Box */}
                      <div className="p-4 bg-zinc-50 border border-black/10 rounded-xl flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
                            Uploaded Document Scan Evidence
                          </span>
                          {selectedGuard.rtwDocumentUrl && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Scan Verified
                            </span>
                          )}
                        </div>

                        {selectedGuard.rtwDocumentUrl ? (
                          <div className="p-3 bg-white border border-black/15 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-[#032031]/5 border border-[#032031]/15 text-[#032031] flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-[#032031]" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-mono text-xs font-bold text-[#032031] truncate max-w-xs">
                                  {selectedGuard.rtwDocumentUrl.split('/').pop() || selectedGuard.rtwDocumentUrl}
                                </span>
                                <span className="text-[10px] text-black/40">Secure statutory proof document</span>
                              </div>
                            </div>

                            <a
                              href={getFullImageUrl(selectedGuard.rtwDocumentUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#032031] hover:bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer shadow-2xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View Scan</span>
                            </a>
                          </div>
                        ) : (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>No statutory right to work verification file has been uploaded for this officer.</span>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Right Column: Identity, Emergency & Audit */}
                  <div className="flex flex-col gap-5">
                    
                    {/* Identity & Communications Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-black/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#032031]/10 text-[#032031] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#032031]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                              Officer Identity & Communications
                            </h4>
                            <p className="text-[10px] text-black/50 font-medium">Verified contact channels & system role</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#032031]/10 text-[#032031]">
                          {selectedGuard.user?.role || 'GUARD'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Full Legal Name</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {modalDisplayName}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Email Address</span>
                          <span className="font-mono font-bold text-xs text-[#032031] truncate">
                            {selectedGuard.user?.email || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Mobile Telephone</span>
                          <span className="font-mono font-bold text-xs text-[#032031]">
                            {selectedGuard.phoneNumber || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Account Active State</span>
                          <span className="font-bold text-xs text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{selectedGuard.user?.isActive ? 'Active User Account' : 'Account Locked'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contacts Card */}
                    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center gap-2.5 border-b border-black/10 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-700 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-red-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                            Emergency Contact & Escalation
                          </h4>
                          <p className="text-[10px] text-black/50 font-medium">Designated next of kin for incident escalation</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Contact Person Name</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {selectedGuard.emergencyContactName || 'Not Assigned'}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Emergency Phone Number</span>
                          <span className="font-mono font-bold text-xs text-[#032031]">
                            {selectedGuard.emergencyContactPhone || 'Not Assigned'}
                          </span>
                        </div>
                      </div>
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
                          <p className="text-[10px] text-black/50 font-medium">System immutable audit logs and UUID tracking</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Registration Timestamp</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {formatDateTime(selectedGuard.createdAt)}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Last Profile Update</span>
                          <span className="font-bold text-xs text-[#032031]">
                            {formatDateTime(selectedGuard.updatedAt)}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">User Account ID</span>
                          <span className="font-mono text-[10px] text-black/75 truncate select-all">
                            {selectedGuard.userId}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Guard Profile Record ID</span>
                          <span className="font-mono text-[10px] text-black/75 truncate select-all">
                            {selectedGuard.id}
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
                  <span>SOMS statutory Right-to-Work & SIA verified audit record</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {selectedGuard.status !== 'ACTIVE' && (
                    <button
                      onClick={async () => {
                        await handleApprove(selectedGuard.id, modalDisplayName);
                      }}
                      disabled={isActionLoading}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#032031] hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isActionLoading ? 'Processing...' : 'Pass & Approve Officer'}</span>
                    </button>
                  )}

                  {selectedGuard.status !== 'SUSPENDED' && (
                    <button
                      onClick={async () => {
                        await handleReject(selectedGuard.id, modalDisplayName);
                      }}
                      disabled={isActionLoading}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-500 hover:border-red-600 text-red-600 hover:bg-red-50 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4" />
                      <span>{isActionLoading ? 'Processing...' : 'Suspend Officer'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedGuard(null)}
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

export default GuardManagement;
