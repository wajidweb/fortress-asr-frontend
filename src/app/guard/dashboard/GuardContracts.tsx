'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { contractService, ContractRecord } from '@/services/contract.service';
import { getFullImageUrl } from '@/services/api';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  FileText, 
  RotateCw, 
  FileCheck, 
  ShieldCheck, 
  File,
  Download,
  Calendar,
  Lock
} from 'lucide-react';

export const GuardContracts: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);

  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchContracts = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await contractService.getGuardContracts();
      setContracts(res.contracts || []);
    } catch (err: any) {
      console.error('Error fetching guard contracts:', err);
      addToast(err.message || 'Failed to retrieve your employment contracts.', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full flex flex-col gap-6 font-jakarta antialiased text-black">
      {/* Top Banner */}
      <div className="w-full bg-white border border-black rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Officer Portal • Employment Terms
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#032031]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#032031]">
              My Contracts
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Employment Agreements & Terms</h1>
          <p className="text-xs font-semibold text-black/70">
            View and download your official security employment agreements, contractor contracts, and signed terms.
          </p>
        </div>

        <button
          onClick={() => fetchContracts(true)}
          className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer self-start md:self-auto shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 text-black ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Documents
        </button>
      </div>

      {/* Contracts Container */}
      <div className="w-full bg-white border border-black rounded-xl p-6 shadow-xs">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <LoaderRectangle />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Retrieving employment records...
            </span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-16 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-center text-slate-400">
            <FileCheck className="w-10 h-10 text-slate-300" />
            <h3 className="text-sm font-black uppercase tracking-wider text-black">
              No Employment Contracts Uploaded
            </h3>
            <p className="text-xs font-medium text-slate-500 max-w-sm">
              Your employment or contractor agreements will be displayed here once uploaded by operations management.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="p-4 bg-slate-50 border border-slate-200 hover:border-black/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-[#032031] shadow-2xs shrink-0">
                    <File className="w-6 h-6 text-[#032031]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-black leading-tight">
                        {contract.title}
                      </h4>
                      <span
                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          contract.status === 'EXPIRED'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : contract.status === 'EXPIRING_SOON'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {contract.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-semibold flex-wrap">
                      <span>{contract.fileName}</span>
                      <span>•</span>
                      <span>{formatFileSize(contract.fileSize)}</span>
                      {contract.startDate && (
                        <>
                          <span>•</span>
                          <span>Effective: {new Date(contract.startDate).toLocaleDateString('en-GB')}</span>
                        </>
                      )}
                      {contract.expiryDate && (
                        <>
                          <span>•</span>
                          <span className={contract.status === 'EXPIRED' ? 'text-red-700 font-bold' : ''}>
                            Renewal Due: {new Date(contract.expiryDate).toLocaleDateString('en-GB')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={getFullImageUrl(contract.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#032031] hover:bg-black text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition flex items-center gap-2 shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  View & Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
