'use client';

import React, { useState, useEffect } from 'react';
import { adminService, GuardProfile } from '@/services/admin.service';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Users, CheckCircle2, AlertTriangle, ShieldCheck, 
  FileText, ExternalLink, ShieldAlert, Award, Phone, Mail, Clock
} from 'lucide-react';

export const GuardManagement: React.FC = () => {
  const [guards, setGuards] = useState<GuardProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Tabs: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'ALL'
  const [activeTab, setActiveTab] = useState<'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'ALL'>('PENDING_APPROVAL');

  // Load guards based on selection
  const loadGuards = async () => {
    setLoading(true);
    setError('');
    try {
      const statusFilter = activeTab === 'ALL' ? undefined : activeTab;
      const res = await adminService.getGuards(statusFilter);
      setGuards(res.guards);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch guard profiles from secure API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuards();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');
    try {
      await adminService.approveGuard(id);
      setSuccess('Guard profile successfully approved and marked as ACTIVE.');
      // Reload list
      await loadGuards();
    } catch (err: any) {
      setError(err.message || 'Failed to approve guard.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');
    try {
      await adminService.rejectGuard(id);
      setSuccess('Guard profile successfully suspended.');
      // Reload list
      await loadGuards();
    } catch (err: any) {
      setError(err.message || 'Failed to reject/suspend guard.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper to format backend uploads URL
  const getFullDocumentUrl = (path: string | null) => {
    if (!path) return '';
    const apiHost = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001';
    return `${apiHost}${path}`;
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-black pb-12 select-none">
      
      {/* Success / Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md text-[10px] font-black uppercase tracking-wider leading-relaxed flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-[10px] font-black uppercase tracking-wider leading-relaxed flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Unified Swiss Modernist Filtering Tab Bar */}
      <div className="flex border-b border-slate-200 gap-1.5 w-full bg-slate-50 p-1.5 rounded-md">
        
        <button
          onClick={() => setActiveTab('PENDING_APPROVAL')}
          className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-1.5
            ${activeTab === 'PENDING_APPROVAL' 
              ? 'bg-[#032031] text-white shadow-xs' 
              : 'text-black hover:bg-slate-200'
            }
          `}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>New Registrations (Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-1.5
            ${activeTab === 'ACTIVE' 
              ? 'bg-[#032031] text-white shadow-xs' 
              : 'text-black hover:bg-slate-200'
            }
          `}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Approved Guards (Active)</span>
        </button>

        <button
          onClick={() => setActiveTab('SUSPENDED')}
          className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-1.5
            ${activeTab === 'SUSPENDED' 
              ? 'bg-[#032031] text-white shadow-xs' 
              : 'text-black hover:bg-slate-200'
            }
          `}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Suspended / Rejected</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-md transition duration-200 flex items-center gap-1.5
            ${activeTab === 'ALL' 
              ? 'bg-[#032031] text-white shadow-xs' 
              : 'text-black hover:bg-slate-200'
            }
          `}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Roster Officers</span>
        </button>

      </div>

      {/* 3. The Core Workspace Table (Geometric Sharp Styling) */}
      <div className="w-full bg-white border border-slate-200 rounded-md shadow-xs overflow-x-auto">
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center p-24 text-slate-400 select-none text-[9px] font-black uppercase tracking-wider min-h-[300px] gap-3">
            <LoaderRectangle />
            <span>Syncing Security Onboard Database...</span>
          </div>
        ) : guards.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center p-20 text-slate-400 select-none text-[9px] font-black uppercase tracking-wider min-h-[250px] gap-2 border-dashed border-2 border-slate-100 m-4 rounded-md max-w-[calc(100%-2rem)]">
            <ShieldAlert className="w-8 h-8 text-[#032031]/10" />
            <span>No officers registered under this status query filter.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 select-none">
                <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-black">Officer Profile Info</th>
                <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-black">Contact Detail</th>
                <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-black">SIA Badge Details</th>
                <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-black">RTW Right to Work Audit</th>
                <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-black">Roster Status</th>
                <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guards.map((guard) => (
                <tr key={guard.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition duration-150">
                  
                  {/* Name and Email */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-[#032031]">
                        {guard.firstName || guard.user?.firstName} {guard.lastName || guard.user?.lastName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 select-all">
                        <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                        {guard.user?.email || 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Phone number */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-black select-all flex items-center gap-1">
                        <Phone className="w-3 h-3 shrink-0 text-slate-400" />
                        {guard.phoneNumber || 'N/A'}
                      </span>
                      <span className="text-[7.5px] text-slate-400 font-black uppercase">Contact Line</span>
                    </div>
                  </td>

                  {/* SIA Badge Details */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      {guard.siaLicenceNumber ? (
                        <>
                          <span className="text-[10px] font-black text-black tracking-widest uppercase select-all flex items-center gap-1">
                            <Award className="w-3 h-3 text-[#032031]" />
                            {guard.siaLicenceNumber}
                          </span>
                          <span className={`text-[7.5px] font-black uppercase leading-none
                            ${guard.siaExpiryDate && new Date(guard.siaExpiryDate) <= new Date() 
                              ? 'text-red-500' 
                              : 'text-emerald-600'
                            }
                          `}>
                            Exp: {guard.siaExpiryDate ? new Date(guard.siaExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                        </>
                      ) : (
                        <span className="text-[8px] text-red-500 font-black uppercase">No Badge Provided</span>
                      )}
                    </div>
                  </td>

                  {/* Right to Work Document */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-black flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {guard.rtwDocumentType || 'Passport'}
                      </span>
                      
                      {guard.rtwDocumentUrl ? (
                        <a 
                          href={getFullDocumentUrl(guard.rtwDocumentUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[8.5px] text-[#032031] font-black underline flex items-center gap-0.5 hover:text-black transition"
                        >
                          <span>Review Document Scan</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[8px] text-red-500 font-black uppercase">No Document File</span>
                      )}
                    </div>
                  </td>

                  {/* Roster Status */}
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-sm
                        ${guard.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : guard.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                        }
                      `}>
                        {guard.status === 'PENDING_APPROVAL' ? 'PENDING AUDIT' : guard.status}
                      </span>
                    </div>
                  </td>

                  {/* Admin Actions column */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      
                      {/* Approve (Pass) button */}
                      {guard.status !== 'ACTIVE' && (
                        <button
                          disabled={actionLoadingId === guard.id}
                          onClick={() => handleApprove(guard.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-black text-white text-[8px] font-black uppercase tracking-wider rounded-sm transition duration-150 disabled:opacity-50"
                        >
                          {actionLoadingId === guard.id ? 'Saving...' : 'Pass / Approve'}
                        </button>
                      )}

                      {/* Reject / Suspend button */}
                      {guard.status !== 'SUSPENDED' && (
                        <button
                          disabled={actionLoadingId === guard.id}
                          onClick={() => handleReject(guard.id)}
                          className="px-3 py-1 bg-[#032031] hover:bg-black text-white text-[8px] font-black uppercase tracking-wider rounded-sm transition duration-150 disabled:opacity-50"
                        >
                          {actionLoadingId === guard.id ? 'Saving...' : 'Reject / Lock'}
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default GuardManagement;
