'use client';

import React, { useState, useEffect } from 'react';
import { adminService, ClientManagementProfile } from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
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
  Lock
} from 'lucide-react';

export const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<ClientManagementProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected client for Modal popup
  const [selectedClient, setSelectedClient] = useState<ClientManagementProfile | null>(null);

  // Tabs: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'ALL'
  const [activeTab, setActiveTab] = useState<'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'ALL'>('PENDING_APPROVAL');

  const addToast = useUIStore((state) => state.addToast);

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

  // Load clients based on active tab
  const loadClients = async () => {
    setLoading(true);
    setError('');
    try {
      const statusFilter = activeTab === 'ALL' ? undefined : activeTab;
      const res = await adminService.getClients(statusFilter);
      setClients(res.clients);

      // If a client is open in modal, update its snapshot
      if (selectedClient) {
        const updatedSelected = res.clients.find(c => c.id === selectedClient.id || c.userId === selectedClient.userId);
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
  };

  useEffect(() => {
    loadClients();
  }, [activeTab]);

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

  // Filter clients by search query
  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const company = (c.companyName || '').toLowerCase();
    const email = (c.user?.email || '').toLowerCase();
    const contact = (c.contactPerson || '').toLowerCase();
    const repName = `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.toLowerCase();
    const slug = (c.urlSlug || '').toLowerCase();
    return company.includes(q) || email.includes(q) || contact.includes(q) || repName.includes(q) || slug.includes(q);
  });

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
              Client Management & Corporate Accounts
            </h1>
            <p className="text-xs text-black/70 font-bold">
              Review new registration applications, approve contract partners, and click any client to view their full verified profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-black text-white rounded-sm text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Total Accounts: {filteredClients.length}</span>
            </span>
          </div>
        </div>

        {/* Tab Bar & Search Row */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-black/15 pb-4">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('PENDING_APPROVAL')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'PENDING_APPROVAL' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>New Registrations (Pending)</span>
            </button>

            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'ACTIVE' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approved Clients</span>
            </button>

            <button
              onClick={() => setActiveTab('SUSPENDED')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'SUSPENDED' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Suspended</span>
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-2 cursor-pointer
                ${activeTab === 'ALL' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white text-black border border-black hover:bg-black/5'
                }
              `}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>All Clients</span>
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
              className="w-full pl-10 pr-4 py-2 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
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
          <div className="w-full border-2 border-dashed border-black/30 rounded-lg p-14 flex flex-col items-center justify-center text-center gap-3">
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
                  className="w-full border-2 border-black rounded-lg p-5 sm:p-6 bg-white hover:shadow-md transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
                >
                  
                  {/* Left: Avatar & Organization Info - Clickable to open modal */}
                  <div 
                    onClick={() => setSelectedClient(client)}
                    className="flex items-start sm:items-center gap-5 sm:gap-6 w-full lg:w-auto cursor-pointer flex-grow"
                    title="Click to view full client details"
                  >
                    
                    {/* Client Logo Avatar with right-side spacing */}
                    <div className="w-16 h-16 rounded-lg bg-black/5 border-2 border-black flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner group-hover:scale-105 transition mr-2 sm:mr-3">
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
                      className="px-3.5 py-2.5 border-2 border-black bg-white hover:bg-black/5 text-black rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                      title="View full client details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {client.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleApprove(client.id, displayName)}
                        disabled={isActionLoading}
                        className="px-4 py-2.5 bg-black hover:bg-black/85 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isActionLoading ? 'Processing...' : 'Approve'}</span>
                      </button>
                    )}

                    {client.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleReject(client.id, displayName)}
                        disabled={isActionLoading}
                        className="px-4 py-2.5 border-2 border-black text-black hover:bg-black hover:text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{isActionLoading ? 'Processing...' : 'Suspend'}</span>
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Full Details Modal Dialog */}
      {selectedClient && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedClient(null)}
        >
          <div 
            className="w-full max-w-3xl bg-white border-2 border-black rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Top Title Bar */}
            <div className="h-14 border-b-2 border-black px-6 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-black" />
                <h3 className="text-xs font-black uppercase tracking-wider text-black">
                  Corporate Client Profile & Audit Record
                </h3>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="p-1.5 border border-black rounded-md hover:bg-black hover:text-white text-black transition cursor-pointer"
                title="Close modal (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-7 select-text">
              
              {/* Hero Organization Identity Card */}
              <div className="p-5 border-2 border-black rounded-lg bg-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-5 sm:gap-6">
                  
                  {/* Logo / Image Box with right-side spacing */}
                  <div className="w-20 h-20 rounded-lg bg-white border-2 border-black flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative mr-2 sm:mr-3">
                    {selectedClient.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getFullImageUrl(selectedClient.logoUrl)}
                        alt={selectedClient.companyName || 'Corporate Client'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-9 h-9 text-black" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-black/60">Official Corporate Entity</span>
                    <h2 className="text-lg font-black text-black tracking-tight uppercase">
                      {selectedClient.companyName || 'Pending Registration'}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {selectedClient.urlSlug && (
                        <span className="px-2 py-0.5 bg-white border border-black rounded text-[8px] font-bold text-black uppercase tracking-wider flex items-center gap-1 font-mono">
                          <Globe className="w-2.5 h-2.5" /> /client/{selectedClient.urlSlug}
                        </span>
                      )}

                      <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        selectedClient.status === 'ACTIVE'
                          ? 'bg-black text-white'
                          : selectedClient.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-900 border border-amber-400'
                          : 'bg-red-600 text-white'
                      }`}>
                        {selectedClient.status === 'ACTIVE'
                          ? 'Active Corporate Partner'
                          : selectedClient.status === 'PENDING_APPROVAL'
                          ? 'Pending Approval'
                          : 'Suspended Account'}
                      </span>
                    </div>
                  </div>

                </div>

                <div className="flex flex-col items-start sm:items-end text-left sm:text-right gap-1 shrink-0">
                  <span className="text-[8px] font-black uppercase tracking-widest text-black/60">Account Inception</span>
                  <span className="text-xs font-black text-black">{formatDate(selectedClient.createdAt)}</span>
                  <span className="text-[8px] font-medium text-black/60">{formatDateTime(selectedClient.createdAt)}</span>
                </div>
              </div>

              {/* Grid 1: Authorized Account Representative */}
              <div className="flex flex-col gap-3">
                <div className="border-b border-black/15 pb-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-black" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black">
                    Primary Account Representative
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Full Legal Name</span>
                    <span className="text-xs font-bold text-black">
                      {selectedClient.user?.firstName || selectedClient.user?.lastName 
                        ? `${selectedClient.user.firstName} ${selectedClient.user.lastName}` 
                        : 'Not Provided'}
                    </span>
                  </div>

                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Account Email Address</span>
                    <span className="text-xs font-bold text-black flex items-center gap-1.5 font-mono">
                      <Mail className="w-3 h-3 text-black" />
                      <span>{selectedClient.user?.email || 'N/A'}</span>
                    </span>
                  </div>

                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Primary Mobile Phone</span>
                    <span className="text-xs font-bold text-black flex items-center gap-1.5 font-mono">
                      <Phone className="w-3 h-3 text-black" />
                      <span>{selectedClient.user?.phoneNumber || selectedClient.contactPhone || 'N/A'}</span>
                    </span>
                  </div>

                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">User Role & Login State</span>
                    <span className="text-xs font-bold text-black flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-black text-white rounded text-[8px] font-black">
                        {selectedClient.user?.role || 'CLIENT'}
                      </span>
                      <span className="text-[9px] font-bold text-black/70">
                        {selectedClient.user?.isActive ? 'Login Enabled' : 'Login Restricted'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Corporate & Contract Specifications */}
              <div className="flex flex-col gap-3">
                <div className="border-b border-black/15 pb-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-black" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black">
                    Corporate Entity & Invoicing Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Corporate Entity Name</span>
                    <span className="text-xs font-bold text-black">
                      {selectedClient.companyName || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Hourly Billing Rate</span>
                    <span className="text-xs font-bold text-black flex items-center gap-1 font-mono">
                      <span>£{selectedClient.billingRateHour || '0.00'} / hour</span>
                    </span>
                  </div>

                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white sm:col-span-2">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Corporate Billing Location (Tax & Invoice Calculations)</span>
                    <span className="text-xs font-bold text-black whitespace-pre-wrap leading-relaxed">
                      {selectedClient.billingAddress || 'No billing address recorded.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 3: Operational Contacts & Monitored Sites */}
              <div className="flex flex-col gap-3">
                <div className="border-b border-black/15 pb-2 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-black" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black">
                    Site Operations & Monitored Locations
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Designated Site Contact</span>
                    <span className="text-xs font-bold text-black">
                      {selectedClient.contactPerson || 'Not Assigned'}
                    </span>
                  </div>

                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Direct Office / Site Phone</span>
                    <span className="text-xs font-bold text-black font-mono">
                      {selectedClient.contactPhone || 'Not Assigned'}
                    </span>
                  </div>

                  <div className="p-3.5 border border-black rounded-md flex flex-col gap-1.5 bg-white sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Assigned Monitored Sites</span>
                      <span className="text-[8px] font-black text-black uppercase">
                        {selectedClient.sites.length} Active {selectedClient.sites.length === 1 ? 'Site' : 'Sites'}
                      </span>
                    </div>

                    {selectedClient.sites.length === 0 ? (
                      <span className="text-xs font-bold text-black/60 italic">No operational sites currently assigned to this corporate account.</span>
                    ) : (
                      <div className="flex flex-col gap-2 pt-1">
                        {selectedClient.sites.map(site => (
                          <div key={site.id} className="p-2.5 bg-black/5 border border-black rounded flex items-center justify-between gap-3 text-xs">
                            <span className="font-bold text-black">{site.name}</span>
                            {site.address && <span className="text-black/60 text-[11px] font-medium truncate max-w-xs">{site.address}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid 4: Audit & System Metadata */}
              <div className="flex flex-col gap-3">
                <div className="border-b border-black/15 pb-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-black" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black">
                    Audit Trail & Timestamps
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Account Opened Date & Time</span>
                    <span className="font-bold text-black">{formatDateTime(selectedClient.createdAt)}</span>
                  </div>

                  <div className="p-3 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Last Profile Update</span>
                    <span className="font-bold text-black">{formatDateTime(selectedClient.updatedAt)}</span>
                  </div>

                  <div className="p-3 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">User Account ID</span>
                    <span className="font-mono text-[10px] text-black select-all">{selectedClient.userId}</span>
                  </div>

                  <div className="p-3 border border-black rounded-md flex flex-col gap-0.5 bg-white">
                    <span className="text-[8px] font-black uppercase tracking-wider text-black/50">Client Profile Record ID</span>
                    <span className="font-mono text-[10px] text-black select-all">{selectedClient.id}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions Bar */}
            <div className="h-16 border-t-2 border-black px-6 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2 text-black text-[10px] font-bold">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Verified SOMS Corporate Account</span>
              </div>

              <div className="flex items-center gap-2.5">
                {selectedClient.status !== 'ACTIVE' && (
                  <button
                    onClick={async () => {
                      const name = selectedClient.companyName;
                      await handleApprove(selectedClient.id, name);
                    }}
                    disabled={actionLoadingId === selectedClient.id || actionLoadingId === selectedClient.userId}
                    className="px-4 py-2 bg-black hover:bg-black/85 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve Client</span>
                  </button>
                )}

                {selectedClient.status !== 'SUSPENDED' && (
                  <button
                    onClick={async () => {
                      const name = selectedClient.companyName;
                      await handleReject(selectedClient.id, name);
                    }}
                    disabled={actionLoadingId === selectedClient.id || actionLoadingId === selectedClient.userId}
                    className="px-4 py-2 border-2 border-black text-black hover:bg-black hover:text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white rounded-md text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ClientManagement;
