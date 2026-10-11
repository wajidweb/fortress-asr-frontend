'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminService, AdminAuditLog } from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Search, 
  RotateCw, 
  Eye, 
  Calendar, 
  Download, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Code2,
  Clock,
  ArrowRight,
  User,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuditLogsManagement: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);

  // Data & loading states
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter & pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Modal / Detail state
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'diff' | 'raw'>('diff');
  const [copiedJson, setCopiedJson] = useState(false);

  // Load audit logs from backend (all activities at one place)
  const fetchLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        page,
        limit,
        search: searchQuery,
        entityType: 'ALL',
        action: actionFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setLogs(res.logs || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err: any) {
      addToast(err.message || 'Failed to retrieve audit logs', 'error');
    } finally {
      if (!isSilent) setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, limit, searchQuery, actionFilter, startDate, endDate, addToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActionFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || actionFilter !== 'ALL' || startDate !== '' || endDate !== '';

  // Export audit dossier as formatted JSON
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await adminService.getAuditLogs({
        search: searchQuery,
        entityType: 'ALL',
        action: actionFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        export: true,
      });

      const exportData = {
        title: 'Fortress ASR Security Systems - Audit Trail',
        generatedAt: new Date().toISOString(),
        totalRecords: res.logs.length,
        logs: res.logs,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fortress-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(`Exported ${res.logs.length} audit records`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to export audit logs', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Human-readable date formatting (British English)
  const formatDate = (dateStr: string) => {
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

  // Modern pill badge styling with hairline borders
  const getActionBadgeClass = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('APPROVED') || act.includes('CREATED') || act.includes('ACTIVAT')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (act.includes('SUSPENDED') || act.includes('REJECTED') || act.includes('DEACTIVAT') || act.includes('CANCEL')) {
      return 'bg-rose-50 text-rose-800 border-rose-300';
    }
    if (act.includes('ASSESS') || act.includes('REVIEW')) {
      return 'bg-amber-50 text-amber-900 border-amber-300';
    }
    if (act.includes('UPDATE') || act.includes('OVERRIDE')) {
      return 'bg-sky-50 text-sky-900 border-sky-300';
    }
    return 'bg-neutral-100 text-black border-neutral-300';
  };

  // Format diff value nicely
  const formatDiffValue = (val: any) => {
    if (val === undefined || val === null) return <span className="text-black italic">None</span>;
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="w-full flex flex-col gap-5 text-black font-jakarta pb-12 select-none animate-fade-in">
      
      {/* 1. Header Section */}
      <div className="w-full bg-white border border-black rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-black">
              Operations Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
            Audit Logs
          </h1>
          <p className="text-xs text-black font-semibold max-w-xl">
            Traceable, tamper-protected record of administrative activities and changes across the system.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-black hover:bg-black/5 text-black text-[11px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer disabled:opacity-50"
            title="Refresh logs"
          >
            <RotateCw className={`w-3.5 h-3.5 text-black ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            <span className="text-black">Refresh</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting || logs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#032031] hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Export filtered records"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Container: Filters + Logs */}
      <div className="w-full bg-white border border-black rounded-xl p-4 sm:p-6 flex flex-col gap-4 shadow-xs">
        
        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between pb-3 border-b border-black/[0.08]">
          
          {/* Search Box */}
          <div className="relative flex-grow max-w-full lg:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by action, administrator, target, or details..."
              className="w-full pl-9 pr-8 py-2 border border-black rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black text-black placeholder:text-black/60 bg-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:opacity-70 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-black" />
              </button>
            )}
          </div>

          {/* Action Filter & Date Range */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Action Dropdown */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-2 border border-black rounded-lg text-xs font-bold bg-white text-black focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="GUARD_APPROVED">Guard Approved</option>
              <option value="GUARD_SUSPENDED">Guard Suspended</option>
              <option value="CLIENT_APPROVED">Client Approved</option>
              <option value="CLIENT_SUSPENDED">Client Suspended</option>
              <option value="SITE_REQUEST_ASSESSED">Request Assessed</option>
              <option value="SITE_REQUEST_APPROVED_AND_PROVISIONED">Request Approved & Provisioned</option>
              <option value="SITE_REQUEST_REJECTED">Request Rejected</option>
              <option value="SITE_UPDATED">Site Updated</option>
            </select>

            {/* Date Pickers */}
            <div className="flex items-center gap-1.5 bg-white border border-black rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-black shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="text-[10px] font-bold focus:outline-none text-black bg-transparent cursor-pointer"
                title="Start date"
              />
              <span className="text-[10px] text-black font-black">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="text-[10px] font-bold focus:outline-none text-black bg-transparent cursor-pointer"
                title="End date"
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-2 border border-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-black/5 transition cursor-pointer text-black"
              >
                Clear
              </button>
            )}

            {/* Record Count Badge */}
            <span className="text-[10px] font-black px-2 py-1 bg-black/[0.05] rounded-md text-black ml-auto lg:ml-0">
              {pagination.total} events
            </span>

          </div>

        </div>

        {/* 3. Logs Presentation */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoaderRectangle />
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              Loading audit stream...
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 border border-dashed border-black/40 rounded-xl flex flex-col items-center justify-center gap-2.5 text-center p-6">
            <Clock className="w-8 h-8 text-black" />
            <h3 className="text-sm font-black text-black uppercase tracking-wider">No Audit Records Found</h3>
            <p className="text-xs text-black font-semibold max-w-sm">
              No administrative events match your active search or date filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 px-3.5 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-black/80 transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-black rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#032031] text-white text-[9px] font-black uppercase tracking-wider">
                    <th className="py-3 px-3.5">Date & Time</th>
                    <th className="py-3 px-3.5">Administrator</th>
                    <th className="py-3 px-3.5">Action</th>
                    <th className="py-3 px-3.5">Affected Record</th>
                    <th className="py-3 px-3.5">Change Summary</th>
                    <th className="py-3 px-3.5">IP Address</th>
                    <th className="py-3 px-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.08] text-xs font-semibold">
                  {logs.map((log) => {
                    const adminName = log.user 
                      ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email
                      : 'System Admin';

                    const entityName = log.details?.entityName || log.entityId || 'System Record';

                    return (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-black/[0.02] transition duration-150 cursor-pointer text-black"
                      >
                        {/* Date */}
                        <td className="py-3 px-3.5 text-[11px] font-bold text-black whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>

                        {/* Admin */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#032031] text-white flex items-center justify-center text-[8px] font-black shrink-0">
                              {adminName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-black text-xs leading-none">
                                {adminName}
                              </span>
                              <span className="text-[9px] text-black font-semibold mt-0.5">
                                {log.user?.role || 'SUPER_ADMIN'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide border ${getActionBadgeClass(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Target Record */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex flex-col max-w-44 truncate">
                            <span className="font-bold text-black truncate text-xs">
                              {entityName}
                            </span>
                            {log.entityType && (
                              <span className="text-[8px] font-bold uppercase text-black">
                                {log.entityType.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Change Summary */}
                        <td className="py-3 px-3.5">
                          <div className="max-w-xs xl:max-w-md truncate text-black text-xs font-semibold">
                            {log.details?.summary || (
                              log.details?.previousValues && log.details?.newValues ? (
                                <span className="text-black font-semibold">Updated {Object.keys(log.details.newValues).length} attributes</span>
                              ) : log.details?.reason || 'Record updated'
                            )}
                          </div>
                        </td>

                        {/* IP */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-[10px] font-mono font-bold text-black">
                          {log.ipAddress || 'Internal'}
                        </td>

                        {/* View Details */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-black hover:bg-black hover:text-white text-black text-[9px] font-black uppercase tracking-wider rounded-md transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-current" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="flex flex-col gap-2.5 md:hidden">
              {logs.map((log) => {
                const adminName = log.user 
                  ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email
                  : 'System Admin';

                const entityName = log.details?.entityName || log.entityId || 'System Record';

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="p-3.5 bg-white border border-black rounded-xl flex flex-col gap-2.5 shadow-2xs hover:shadow-xs transition cursor-pointer text-black"
                  >
                    {/* Top Row: Action & Date */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide border ${getActionBadgeClass(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-black">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>

                    {/* Middle: Target & Change */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-black">
                          {entityName}
                        </span>
                        {log.entityType && (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-black/5 text-black">
                            {log.entityType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-black font-semibold line-clamp-2">
                        {log.details?.summary || log.details?.reason || 'Record updated'}
                      </p>
                    </div>

                    {/* Bottom Row: Admin & Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.08] text-[10px]">
                      <div className="flex items-center gap-1.5 text-black">
                        <div className="w-4 h-4 rounded-full bg-[#032031] text-white flex items-center justify-center text-[7px] font-black">
                          {adminName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold truncate max-w-36 text-black">{adminName}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#032031] text-white text-[9px] font-black uppercase tracking-wider rounded-md transition"
                      >
                        <Eye className="w-2.5 h-2.5 text-white" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 4. Responsive Pagination */}
        {!loading && logs.length > 0 && (
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-black/[0.08]">
            <div className="text-xs font-bold text-black order-2 sm:order-1">
              Showing <span className="font-black text-black">{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}</span> to <span className="font-black text-black">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-black text-black">{pagination.total}</span>
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 border border-black/20 rounded-md text-[10px] font-bold bg-white text-black cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="p-1.5 border border-black/20 rounded-md hover:bg-black/5 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-black"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-black" />
                </button>
                <span className="px-2 text-xs font-black text-black">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-1.5 border border-black/20 rounded-md hover:bg-black/5 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-black"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 5. Redesigned Premium View Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl max-h-[92vh] bg-white border border-black rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-up text-black">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#032031] to-[#052e46] text-white p-5 sm:p-6 flex items-start justify-between border-b border-white/10 shrink-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">
                    Audit Event Dossier
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  {selectedLog.action.replace(/_/g, ' ')}
                </h3>
                <span className="text-[10px] font-mono text-white/80 truncate max-w-md">
                  Ref: {selectedLog.id}
                </span>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 scrollbar-thin text-black">
              
              {/* Meta Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                
                {/* Administrator */}
                <div className="p-3 bg-black/[0.02] border border-black/[0.08] rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-black">
                    <User className="w-3 h-3 text-black" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-black">Admin</span>
                  </div>
                  <span className="text-xs font-black text-black truncate">
                    {selectedLog.user ? `${selectedLog.user.firstName} ${selectedLog.user.lastName}`.trim() || selectedLog.user.email : 'System Admin'}
                  </span>
                  <span className="text-[9px] text-black font-semibold truncate">
                    {selectedLog.user?.email || selectedLog.user?.role || 'SUPER_ADMIN'}
                  </span>
                </div>

                {/* Target Record */}
                <div className="p-3 bg-black/[0.02] border border-black/[0.08] rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-black">
                    <Layers className="w-3 h-3 text-black" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-black">Target</span>
                  </div>
                  <span className="text-xs font-black text-black truncate" title={selectedLog.details?.entityName || ''}>
                    {selectedLog.details?.entityName || selectedLog.entityId || 'N/A'}
                  </span>
                  <span className="text-[9px] text-black font-semibold truncate">
                    Type: {selectedLog.entityType || 'General'}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="p-3 bg-black/[0.02] border border-black/[0.08] rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-black">
                    <Clock className="w-3 h-3 text-black" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-black">Time</span>
                  </div>
                  <span className="text-xs font-black text-black">
                    {formatDate(selectedLog.createdAt)}
                  </span>
                  <span className="text-[9px] text-black font-semibold">
                    Verified Timestamp
                  </span>
                </div>

                {/* Network IP */}
                <div className="p-3 bg-black/[0.02] border border-black/[0.08] rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-black">
                    <Clock className="w-3 h-3 text-black" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-black">Origin</span>
                  </div>
                  <span className="text-xs font-mono font-black text-black truncate">
                    {selectedLog.ipAddress || 'Internal Network'}
                  </span>
                  <span className="text-[9px] text-black font-semibold">
                    Client Gateway
                  </span>
                </div>

              </div>

              {/* Summary Banner */}
              {selectedLog.details?.summary && (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-950">
                      Change Summary
                    </span>
                    <p className="text-xs font-bold text-emerald-900 leading-relaxed">
                      {selectedLog.details.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Reason / Notes Banner */}
              {selectedLog.details?.reason && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-950">
                      Administrative Reason / Notes
                    </span>
                    <p className="text-xs font-bold text-amber-900 leading-relaxed">
                      {selectedLog.details.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Segmented Pill Tabs */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-1 border-b border-black/[0.08]">
                  <div className="inline-flex p-1 bg-black/[0.05] rounded-xl gap-1">
                    <button
                      onClick={() => setActiveModalTab('diff')}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5
                        ${activeModalTab === 'diff' 
                          ? 'bg-white text-black shadow-xs' 
                          : 'text-black hover:bg-white/50'
                        }
                      `}
                    >
                      <SlidersHorizontal className="w-3 h-3 text-black" />
                      <span className="text-black">State Diff</span>
                    </button>

                    <button
                      onClick={() => setActiveModalTab('raw')}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5
                        ${activeModalTab === 'raw' 
                          ? 'bg-white text-black shadow-xs' 
                          : 'text-black hover:bg-white/50'
                        }
                      `}
                    >
                      <Code2 className="w-3 h-3 text-black" />
                      <span className="text-black">Decrypted JSON</span>
                    </button>
                  </div>

                  {activeModalTab === 'raw' && (
                    <button
                      onClick={handleCopyJson}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border border-black hover:bg-black/5 transition cursor-pointer text-black"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span className="text-emerald-800 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-black" />
                          <span className="text-black">Copy Payload</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Tab Content: Diff View */}
                {activeModalTab === 'diff' ? (
                  <div>
                    {selectedLog.details?.previousValues || selectedLog.details?.newValues ? (
                      <div className="flex flex-col gap-2.5">
                        {Array.from(
                          new Set([
                            ...Object.keys(selectedLog.details.previousValues || {}),
                            ...Object.keys(selectedLog.details.newValues || {}),
                          ])
                        ).map((key) => {
                          const prevVal = selectedLog.details.previousValues?.[key];
                          const newVal = selectedLog.details.newValues?.[key];

                          return (
                            <div 
                              key={key} 
                              className="border border-black rounded-xl p-3 bg-white flex flex-col gap-2 shadow-2xs"
                            >
                              {/* Field Name */}
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black text-black px-2 py-0.5 rounded bg-black/[0.05]">
                                  {key}
                                </span>
                                <span className="text-[9px] font-black uppercase text-black">
                                  Attribute Transition
                                </span>
                              </div>

                              {/* Diff Grid: Before and After */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                
                                {/* Before */}
                                <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-300 flex flex-col gap-1">
                                  <span className="text-[8px] font-black uppercase tracking-wider text-rose-900">
                                    Previous State
                                  </span>
                                  <div className="font-mono text-xs text-rose-950 font-bold break-all">
                                    {formatDiffValue(prevVal)}
                                  </div>
                                </div>

                                {/* After */}
                                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 flex flex-col gap-1">
                                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-900">
                                    Updated State
                                  </span>
                                  <div className="font-mono text-xs text-emerald-950 font-black break-all">
                                    {formatDiffValue(newVal)}
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 bg-black/[0.02] border border-dashed border-black/20 rounded-xl text-center text-xs text-black font-semibold">
                        No individual field transitions were captured for this action.
                      </div>
                    )}
                  </div>
                ) : (
                  /* Tab Content: Raw JSON View */
                  <pre className="p-4 bg-[#090d16] text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-64 border border-black/10 scrollbar-thin">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black/[0.02] border-t border-black/[0.08] flex items-center justify-between shrink-0">
              <span className="text-[10px] text-black font-semibold hidden sm:inline">
                Audit history cannot be modified or deleted.
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-[#032031] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ml-auto"
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

export default AuditLogsManagement;
