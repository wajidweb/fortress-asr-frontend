'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { contractService, ContractRecord } from '@/services/contract.service';
import { getFullImageUrl } from '@/services/api';
import { useUIStore } from '@/store/useUIStore';
import { 
  FileText, 
  Upload, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Plus, 
  X,
  FileCheck,
  File,
  RotateCw
} from 'lucide-react';

interface ContractsSectionProps {
  clientId?: string;
  guardId?: string;
  siteId?: string;
  serviceRequestId?: string;
  entityName: string;
}

export const ContractsSection: React.FC<ContractsSectionProps> = ({
  clientId,
  guardId,
  siteId,
  serviceRequestId,
  entityName,
}) => {
  const addToast = useUIStore((state) => state.addToast);

  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchContracts = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await contractService.getAdminContracts({ clientId, guardId, siteId, serviceRequestId });
      setContracts(res.contracts || []);
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      addToast(err.message || 'Failed to load contracts', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [clientId, guardId, siteId, serviceRequestId, addToast]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Pre-fill title from filename (removing extension)
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('Please select a contract document or image to upload.', 'error');
      return;
    }
    if (!title.trim()) {
      addToast('Contract title is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('file', selectedFile);
      if (clientId) formData.append('clientId', clientId);
      if (guardId) formData.append('guardId', guardId);
      if (siteId) formData.append('siteId', siteId);
      if (serviceRequestId) formData.append('serviceRequestId', serviceRequestId);
      if (startDate) formData.append('startDate', startDate);
      if (expiryDate) formData.append('expiryDate', expiryDate);

      const res = await contractService.uploadContract(formData);
      addToast(res.message || 'Contract uploaded successfully!', 'success');

      // Reset form
      setTitle('');
      setStartDate('');
      setExpiryDate('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadForm(false);

      fetchContracts(true);
    } catch (err: any) {
      console.error('Error uploading contract:', err);
      addToast(err.message || 'Failed to upload contract.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, contractTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete the contract "${contractTitle}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await contractService.deleteContract(id);
      addToast('Contract deleted successfully.', 'success');
      setContracts((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting contract:', err);
      addToast(err.message || 'Failed to delete contract.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full flex flex-col gap-4 font-jakarta text-black">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#032031]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-black">
            {clientId ? 'Service Agreements & Contracts' : 'Employment & Contractor Agreements'}
          </h4>
          <span className="text-[10px] font-bold text-slate-500">({contracts.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchContracts(true)}
            className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 transition cursor-pointer"
            title="Refresh contracts"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {!showUploadForm && (
            <button
              type="button"
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#032031] text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-black transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Contract
            </button>
          )}
        </div>
      </div>

      {/* Upload Form Box */}
      {showUploadForm && (
        <form
          onSubmit={handleUploadSubmit}
          className="p-4 bg-slate-50 border border-black/15 rounded-xl flex flex-col gap-3 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-black">
              Attach Contract Document for {entityName}
            </span>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="p-1 text-slate-400 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Title */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Contract Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Services Agreement 2026-2027"
                className="px-3 py-1.5 text-xs font-semibold border border-black/20 rounded-lg focus:border-black focus:outline-none"
                required
              />
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Effective Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-black/20 rounded-lg focus:border-black focus:outline-none"
              />
            </div>

            {/* Expiry Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Contract Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-black/20 rounded-lg focus:border-black focus:outline-none"
              />
            </div>

            {/* File Picker */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Select File (PDF, DOCX, JPG, PNG) *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#032031] file:text-white hover:file:bg-black cursor-pointer"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="px-4 py-1.5 bg-[#032031] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Uploading Document...' : 'Upload Contract'}
            </button>
          </div>
        </form>
      )}

      {/* Contracts List */}
      {loading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-400">
          Loading contracts...
        </div>
      ) : contracts.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-slate-400">
          <FileCheck className="w-8 h-8 text-slate-300" />
          <span className="text-[11px] font-black uppercase tracking-wider">
            No Contracts on File
          </span>
          <span className="text-[10px] font-medium text-slate-500">
            No signed agreements have been uploaded yet for this {clientId ? 'client' : 'guard'}.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="p-3 bg-white border border-slate-200 hover:border-black/40 rounded-xl flex items-center justify-between gap-3 transition shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                  <File className="w-4 h-4 text-[#032031]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black text-black leading-tight">{c.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                    <span>{c.fileName}</span>
                    <span>•</span>
                    <span>{formatFileSize(c.fileSize)}</span>
                    {c.expiryDate && (
                      <>
                        <span>•</span>
                        <span className={c.status === 'EXPIRED' ? 'text-red-700 font-bold' : ''}>
                          Expires: {new Date(c.expiryDate).toLocaleDateString('en-GB')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm ${
                    c.status === 'EXPIRED'
                      ? 'bg-red-100 text-red-800'
                      : c.status === 'EXPIRING_SOON'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {c.status}
                </span>

                <a
                  href={getFullImageUrl(c.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-black border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  title="View / Download Contract"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.title)}
                  disabled={deletingId === c.id}
                  className="p-1.5 text-red-500 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                  title="Delete Contract"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
