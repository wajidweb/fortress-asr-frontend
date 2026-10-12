'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  adminService,
  StaffMember,
  StaffStats,
  StaffPagination,
  InviteStaffPayload,
} from '../../../services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  RotateCw,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  Key,
  Lock,
  Building2,
  Briefcase,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Sliders,
  Send,
  UserCheck,
  Filter,
  Check,
  Layers,
  Sparkles,
  ArrowUpRight,
  Radio,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    id: 'FULL_OPERATIONS' as const,
    name: 'Full Operations',
    shortName: 'Full Ops',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    description: 'Full operational control over guards, sites, shifts, and incidents.',
  },
  {
    id: 'DISPATCHER' as const,
    name: 'Control Room Dispatcher',
    shortName: 'Dispatcher',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    description: 'Shift scheduling, guard dispatch, patrols, and live monitoring.',
  },
  {
    id: 'READ_ONLY' as const,
    name: 'Read-Only Auditor',
    shortName: 'Read-Only',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    description: 'Dashboard observation only with zero edit or approval rights.',
  },
  {
    id: 'CUSTOM' as const,
    name: 'Custom Configuration',
    shortName: 'Custom',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
    description: 'Custom granular switches configured via the matrix below.',
  },
];

export default function UsersRolesManagement() {
  const addToast = useUIStore((state) => state.addToast);
  const currentUser = useAuthStore((state) => state.user);

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    superAdminsCount: 0,
    supervisorsCount: 0,
    activeCount: 0,
    pendingInviteCount: 0,
    fullOperationsCount: 0,
    dispatcherCount: 0,
    readOnlyCount: 0,
  });

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<StaffPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Schema metadata
  const [schema, setSchema] = useState<{
    templates: Record<string, string[]>;
    availablePermissions: Array<{ id: string; label: string; category: string }>;
  } | null>(null);

  // Modal States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteStaffPayload>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    jobTitle: '',
    department: '',
    template: 'FULL_OPERATIONS',
    permissions: [],
  });

  // Edit Permissions Modal
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editTemplate, setEditTemplate] = useState<'FULL_OPERATIONS' | 'DISPATCHER' | 'READ_ONLY' | 'CUSTOM'>('FULL_OPERATIONS');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Status toggle confirmation modal
  const [statusActionTarget, setStatusActionTarget] = useState<StaffMember | null>(null);
  const [statusActionSubmitting, setStatusActionSubmitting] = useState(false);

  // Delete Staff Modal states
  const [deleteTargetStaff, setDeleteTargetStaff] = useState<StaffMember | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Resend invite action
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Load staff directory
  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getStaff({
        search: search.trim() || undefined,
        template: templateFilter,
        status: statusFilter,
        page,
        limit,
      });
      setStaff(res.staff || []);
      setStats(res.stats);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to load internal staff list', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [search, templateFilter, statusFilter, page, limit, addToast]);

  // Fetch permission schema once
  useEffect(() => {
    adminService
      .getAvailablePermissions()
      .then((data) => setSchema(data))
      .catch((err) => console.error('Failed to load permission schema:', err));
  }, []);

  // Debounced search / filter reload
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStaff();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadStaff]);

  // Reset to page 1 on search or filter change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleTemplateFilterChange = (val: string) => {
    setTemplateFilter(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadStaff();
  };

  // Grouped permissions for custom mode
  const groupedPermissions = useMemo(() => {
    if (!schema?.availablePermissions) return {};
    return schema.availablePermissions.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, Array<{ id: string; label: string }>>);
  }, [schema]);

  // Handle invitation submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || !inviteForm.jobTitle) {
      const msg = 'Please fill in all required fields (First Name, Last Name, Corporate Email, and Official Title).';
      setInviteError(msg);
      addToast(msg, 'error');
      return;
    }

    setInviteSubmitting(true);
    try {
      const payload: InviteStaffPayload = {
        ...inviteForm,
        permissions:
          inviteForm.template === 'CUSTOM'
            ? inviteForm.permissions
            : schema?.templates[inviteForm.template] || [],
      };
      const res = await adminService.inviteStaff(payload);
      addToast(res.message || 'Invitation sent successfully!', 'success');
      setShowInviteModal(false);
      setInviteError(null);
      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        jobTitle: '',
        department: '',
        template: 'FULL_OPERATIONS',
        permissions: [],
      });
      loadStaff();
    } catch (err: any) {
      const msg = err?.message || 'Failed to dispatch staff invitation. Please verify user details.';
      setInviteError(msg);
      addToast(msg, 'error');
    } finally {
      setInviteSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (member: StaffMember) => {
    setEditError(null);
    setEditingStaff(member);
    setEditTemplate((member.staffProfile?.template as any) || 'FULL_OPERATIONS');
    setEditPermissions(member.staffProfile?.permissions || []);
    setEditJobTitle(member.staffProfile?.jobTitle || '');
    setEditDepartment(member.staffProfile?.department || '');
  };

  // Handle Edit Permissions Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setEditError(null);

    setEditSubmitting(true);
    try {
      const resolved =
        editTemplate === 'CUSTOM'
          ? editPermissions
          : schema?.templates[editTemplate] || [];

      await adminService.updateStaffPermissions(editingStaff.id, {
        template: editTemplate,
        permissions: resolved,
        jobTitle: editJobTitle,
        department: editDepartment,
      });

      addToast('Staff role permissions updated successfully!', 'success');
      setEditingStaff(null);
      setEditError(null);
      loadStaff();
    } catch (err: any) {
      const msg = err?.message || 'Failed to update staff permissions.';
      setEditError(msg);
      addToast(msg, 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async () => {
    if (!statusActionTarget) return;
    setStatusActionSubmitting(true);
    try {
      const newStatus = !statusActionTarget.isActive;
      await adminService.toggleStaffStatus(statusActionTarget.id, newStatus);
      addToast(`Staff account ${newStatus ? 'activated' : 'deactivated'} successfully.`, 'success');
      setStatusActionTarget(null);
      loadStaff();
    } catch (err: any) {
      addToast(err?.message || 'Failed to change staff status.', 'error');
    } finally {
      setStatusActionSubmitting(false);
    }
  };

  // Resend invitation
  const handleResendInvite = async (id: string) => {
    setResendingId(id);
    try {
      const res = await adminService.resendStaffInvitation(id);
      addToast(res.message || 'Invitation resent successfully!', 'success');
      loadStaff();
    } catch (err: any) {
      addToast(err?.message || 'Failed to resend invitation.', 'error');
    } finally {
      setResendingId(null);
    }
  };

  // Open Delete confirmation modal
  const openDeleteModal = (member: StaffMember) => {
    setDeleteTargetStaff(member);
    setConfirmNameInput('');
    setDeleteError(null);
  };

  // Permanently delete staff account
  const handleDeleteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTargetStaff) return;

    const targetFullName = `${deleteTargetStaff.firstName} ${deleteTargetStaff.lastName}`.trim() || deleteTargetStaff.email;
    if (confirmNameInput.trim().toLowerCase() !== targetFullName.toLowerCase()) {
      setDeleteError(`Please type "${targetFullName}" exactly to confirm deletion.`);
      return;
    }

    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      const res = await adminService.deleteStaff(deleteTargetStaff.id);
      addToast(res.message || 'Staff account permanently deleted.', 'success');
      setDeleteTargetStaff(null);
      setConfirmNameInput('');
      loadStaff();
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete staff account.';
      setDeleteError(msg);
      addToast(msg, 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Checkbox toggle helpers for custom permissions
  const togglePermission = (
    permId: string,
    currentList: string[],
    setter: (l: string[]) => void
  ) => {
    if (currentList.includes(permId)) {
      setter(currentList.filter((p) => p !== permId));
    } else {
      setter([...currentList, permId]);
    }
  };

  const toggleCategoryPermissions = (
    perms: Array<{ id: string }>,
    currentList: string[],
    setter: (l: string[]) => void
  ) => {
    const permIds = perms.map((p) => p.id);
    const allSelected = permIds.every((id) => currentList.includes(id));
    if (allSelected) {
      setter(currentList.filter((id) => !permIds.includes(id)));
    } else {
      const unique = Array.from(new Set([...currentList, ...permIds]));
      setter(unique);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Header Banner & Actions */}
      <div className="w-full bg-white border border-black rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-black">
              Operations Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
            Users & Roles
          </h1>
          <p className="text-xs text-black font-semibold max-w-xl">
            Manage employee accounts, assign operational roles, and set access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-black hover:bg-black/5 text-black text-[11px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer disabled:opacity-50"
            title="Refresh records"
          >
            <RotateCw className={`w-3.5 h-3.5 text-black ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            <span className="text-black">Refresh</span>
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#032031] hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
            title="Invite new employee"
          >
            <UserPlus className="w-3.5 h-3.5 text-white" />
            <span>Invite Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Operational Command & Filter Bar (Single Row) */}
      <div className="w-full bg-white border border-black rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Left Segment: Quick-Filter KPI Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 xl:pb-0 no-scrollbar shrink-0">
          {/* Pill 1: All Personnel */}
          <button
            type="button"
            onClick={() => {
              setTemplateFilter('ALL');
              setStatusFilter('ALL');
              setPage(1);
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              templateFilter === 'ALL' && statusFilter === 'ALL'
                ? 'bg-[#032031] text-white border-[#032031] shadow-2xs'
                : 'bg-white text-black/70 border-black/15 hover:border-black hover:text-black'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>All Personnel</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                templateFilter === 'ALL' && statusFilter === 'ALL'
                  ? 'bg-white/20 text-white'
                  : 'bg-black/5 text-[#032031]'
              }`}
            >
              {stats.totalStaff}
            </span>
          </button>

          {/* Pill 2: Active on Duty */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ACTIVE');
              setTemplateFilter('ALL');
              setPage(1);
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                : 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-500'
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Active</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {stats.activeCount}
            </span>
          </button>

          {/* Pill 3: Pending Invites */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter('PENDING');
              setTemplateFilter('ALL');
              setPage(1);
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-amber-800 border-amber-200 hover:border-amber-500'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Pending</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                statusFilter === 'PENDING'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {stats.pendingInviteCount}
            </span>
          </button>

          {/* Pill 4: Read-Only Auditors */}
          <button
            type="button"
            onClick={() => {
              setTemplateFilter('READ_ONLY');
              setStatusFilter('ALL');
              setPage(1);
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              templateFilter === 'READ_ONLY'
                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                : 'bg-white text-blue-800 border-blue-200 hover:border-blue-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>Auditors</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                templateFilter === 'READ_ONLY'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {stats.readOnlyCount}
            </span>
          </button>
        </div>

        {/* Right Segment: Search & Dropdown Filters in the same row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 xl:justify-end min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 max-w-full sm:max-w-xs min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search personnel..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#032031] text-black font-medium transition"
            />
          </div>

          {/* Template Select */}
          <div className="shrink-0">
            <select
              value={templateFilter}
              onChange={(e) => handleTemplateFilterChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-black/20 rounded-lg text-xs font-bold text-black focus:outline-none focus:border-[#032031] cursor-pointer"
            >
              <option value="ALL">Templates: All</option>
              <option value="FULL_OPERATIONS">Full Ops</option>
              <option value="DISPATCHER">Dispatcher</option>
              <option value="READ_ONLY">Read-Only</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-black/20 rounded-lg text-xs font-bold text-black focus:outline-none focus:border-[#032031] cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Deactivated</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Staff Directory Container */}
      <div className="w-full bg-white border border-black rounded-xl p-3.5 sm:p-5 lg:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/10 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#032031] shrink-0" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#032031]">
              Internal Personnel ({pagination.total})
            </h2>
          </div>
          <span className="text-[10px] font-bold text-black/50">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-4">
            <LoaderRectangle />
            <p className="text-xs font-black uppercase tracking-wider text-black/60">
              Loading staff directory...
            </p>
          </div>
        ) : staff.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-black/40">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-black">No personnel found</h3>
            <p className="text-xs text-black/60 max-w-sm">
              No internal staff members match the selected search query or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Large screens: lg and up) */}
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-black/10 bg-zinc-50 text-[10px] font-black uppercase tracking-wider text-black/70">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role & Appointment</th>
                    <th className="py-3 px-4">Permission Template</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Invited / Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs font-medium">
                  {staff.map((member) => {
                    const isSuperAdmin = member.role === 'SUPER_ADMIN';
                    const isPending = !member.isEmailVerified && !member.isActive;
                    const templateConfig = PRESET_TEMPLATES.find(
                      (t) => t.id === member.staffProfile?.template
                    ) || {
                      id: 'CUSTOM',
                      name: 'Custom',
                      shortName: 'Custom',
                      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
                    };

                    return (
                      <tr key={member.id} className="hover:bg-black/[0.02] transition">
                        {/* Member Info */}
                        <td className="py-3.5 px-4 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${
                              isSuperAdmin
                                ? 'bg-[#032031] text-white border-black'
                                : 'bg-slate-100 text-[#032031] border-slate-300'
                            }`}>
                              {member.firstName ? member.firstName.charAt(0) : 'U'}
                              {member.lastName ? member.lastName.charAt(0) : ''}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[#032031] truncate">
                                {member.firstName ? `${member.firstName} ${member.lastName}` : 'System Administrator'}
                              </span>
                              <span className="text-[11px] text-black/60 flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 inline text-black/40 shrink-0" /> {member.email}
                              </span>
                              {member.phoneNumber && (
                                <span className="text-[10px] text-black/50 flex items-center gap-1 truncate">
                                  <Phone className="w-2.5 h-2.5 inline text-black/40 shrink-0" /> {member.phoneNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role & Appointment */}
                        <td className="py-3.5 px-4 min-w-[180px]">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                              isSuperAdmin
                                ? 'bg-black text-white border-black'
                                : 'bg-slate-100 text-[#032031] border-slate-300'
                            }`}>
                              {isSuperAdmin ? 'Super Admin' : 'Supervisor'}
                            </span>
                            <span className="text-xs font-bold text-black truncate">
                              {member.staffProfile?.jobTitle || (isSuperAdmin ? 'Master Administrator' : 'Operations Supervisor')}
                            </span>
                            {member.staffProfile?.department && (
                              <span className="text-[10px] text-black/50 font-semibold flex items-center gap-1 truncate">
                                <Building2 className="w-3 h-3 text-black/40 shrink-0" /> {member.staffProfile.department}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Template & Permissions */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          {isSuperAdmin ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Universal Access</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className={`w-fit px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${templateConfig.badgeClass}`}>
                                {templateConfig.name}
                              </span>
                              <span className="text-[10px] text-black/50 font-semibold">
                                {member.staffProfile?.permissions?.length || 0} permissions granted
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" /> Pending Invite
                            </span>
                          ) : member.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="w-3 h-3 text-red-600 shrink-0" /> Deactivated
                            </span>
                          )}
                        </td>

                        {/* Invited / Created */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-black/70 min-w-[100px]">
                          {new Date(member.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[180px]">
                          {isSuperAdmin ? (
                            <span className="text-[10px] text-black/40 italic font-medium">Protected Owner</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {isPending && (
                                <button
                                  onClick={() => handleResendInvite(member.id)}
                                  disabled={resendingId === member.id}
                                  className="px-2.5 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-amber-100 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  title="Resend invitation email"
                                >
                                  <Send className="w-3 h-3 shrink-0" />
                                  <span>{resendingId === member.id ? 'Sending...' : 'Resend'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => openEditModal(member)}
                                className="px-2.5 py-1.5 bg-white border border-black/30 text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-[#032031] hover:text-white hover:border-[#032031] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Edit staff permissions"
                              >
                                <Sliders className="w-3 h-3 shrink-0" />
                                <span>Permissions</span>
                              </button>

                              <button
                                onClick={() => setStatusActionTarget(member)}
                                className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition cursor-pointer shadow-2xs ${
                                  member.isActive
                                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {member.isActive ? 'Deactivate' : 'Activate'}
                              </button>

                              <button
                                onClick={() => openDeleteModal(member)}
                                className="px-2.5 py-1.5 text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Permanently delete staff account"
                              >
                                <Trash2 className="w-3 h-3 shrink-0" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card List View (Phones & Tablets: hidden on lg and up) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 block lg:hidden w-full">
              {staff.map((member) => {
                const isSuperAdmin = member.role === 'SUPER_ADMIN';
                const isPending = !member.isEmailVerified && !member.isActive;
                const templateConfig = PRESET_TEMPLATES.find(
                  (t) => t.id === member.staffProfile?.template
                ) || {
                  id: 'CUSTOM',
                  name: 'Custom',
                  shortName: 'Custom',
                  badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
                };

                return (
                  <div
                    key={member.id}
                    className="border border-black/15 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 bg-white shadow-2xs hover:border-black/30 transition"
                  >
                    {/* Top Row: Avatar, Name, Email, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${
                          isSuperAdmin
                            ? 'bg-[#032031] text-white border-black'
                            : 'bg-slate-100 text-[#032031] border-slate-300'
                        }`}>
                          {member.firstName ? member.firstName.charAt(0) : 'U'}
                          {member.lastName ? member.lastName.charAt(0) : ''}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-sm text-[#032031] truncate">
                            {member.firstName ? `${member.firstName} ${member.lastName}` : 'System Administrator'}
                          </span>
                          <span className="text-[11px] text-black/60 flex items-center gap-1 break-all">
                            <Mail className="w-3 h-3 text-black/40 shrink-0" /> {member.email}
                          </span>
                          {member.phoneNumber && (
                            <span className="text-[10px] text-black/50 flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5 text-black/40 shrink-0" /> {member.phoneNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isPending ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                            Pending
                          </span>
                        ) : member.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                            Deactivated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-black/10">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-black/50 block">Appointment</span>
                        <div className="flex flex-col mt-0.5">
                          <span className="font-bold text-black text-xs truncate">
                            {member.staffProfile?.jobTitle || (isSuperAdmin ? 'Master Administrator' : 'Operations Supervisor')}
                          </span>
                          {member.staffProfile?.department && (
                            <span className="text-[10px] text-black/50 font-semibold truncate flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5 text-black/40 shrink-0" /> {member.staffProfile.department}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-black/50 block">Access Template</span>
                        <div className="flex flex-col items-start mt-0.5">
                          {isSuperAdmin ? (
                            <span className="text-xs font-bold text-black flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" /> Universal
                            </span>
                          ) : (
                            <>
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${templateConfig.badgeClass}`}>
                                {templateConfig.shortName}
                              </span>
                              <span className="text-[9px] text-black/50 mt-0.5">
                                {member.staffProfile?.permissions?.length || 0} permissions
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Date & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-black/10">
                      <span className="text-[10px] text-black/50 font-semibold">
                        Joined: {new Date(member.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>

                      {!isSuperAdmin ? (
                        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                          {isPending && (
                            <button
                              onClick={() => handleResendInvite(member.id)}
                              disabled={resendingId === member.id}
                              className="px-2.5 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3 h-3 shrink-0" /> Resend
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(member)}
                            className="px-2.5 py-1.5 border border-black text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders className="w-3 h-3 shrink-0" /> Permissions
                          </button>
                          <button
                            onClick={() => setStatusActionTarget(member)}
                            className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border cursor-pointer ${
                              member.isActive
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {member.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openDeleteModal(member)}
                            className="px-2.5 py-1.5 text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            title="Permanently delete staff account"
                          >
                            <Trash2 className="w-3 h-3 shrink-0" /> Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-black/40 italic font-medium">Protected Owner</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5. Responsive Pagination Controls */}
            {pagination.total > 0 && (
              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-black/10">
                <div className="text-xs font-bold text-black order-2 sm:order-1 text-center sm:text-left">
                  Showing{' '}
                  <span className="font-black text-[#032031]">
                    {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                  </span>{' '}
                  to{' '}
                  <span className="font-black text-[#032031]">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-black text-[#032031]">{pagination.total}</span> staff members
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 border border-black/20 rounded-xl text-xs font-bold bg-white text-black cursor-pointer focus:outline-none focus:border-[#032031]"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page <= 1}
                      className="p-2 border border-black/20 rounded-xl hover:bg-black/5 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-black"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-black" />
                    </button>
                    <span className="px-3 text-xs font-black text-[#032031]">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 border border-black/20 rounded-xl hover:bg-black/5 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-black"
                      title="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: INVITE EMPLOYEE MODAL (Redesigned Wide Panel)   */}
      {/* ======================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-5xl w-full flex flex-col shadow-2xl my-auto max-h-[92vh] text-black overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-black/10 shrink-0 bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#032031] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
                    Employee Onboarding & Credential Provisioning
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-[#032031] tracking-tight">
                    Invite Staff Member & Configure Access
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-xl hover:bg-black/5 text-black/60 hover:text-black transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form id="invite-staff-form" onSubmit={handleInviteSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
              {/* In-Modal Error Alert Banner */}
              {inviteError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-red-700 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-red-800">
                        Unable to Dispatch Invitation
                      </span>
                      <span className="text-xs font-semibold leading-relaxed text-red-700">
                        {inviteError}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInviteError(null)}
                    className="p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-700 transition cursor-pointer shrink-0"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Left Column: Personnel Information */}
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-black/10">
                    <Users className="w-4 h-4 text-[#032031]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                      1. Personnel Information
                    </h3>
                  </div>

                  <div className="flex-1 flex flex-col justify-between gap-3">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteForm.firstName}
                          onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                          placeholder="e.g. Marcus"
                          className="px-3.5 py-2.5 text-xs border border-black/20 rounded-xl focus:outline-none focus:border-[#032031] text-black font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteForm.lastName}
                          onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                          placeholder="e.g. Vance"
                          className="px-3.5 py-2.5 text-xs border border-black/20 rounded-xl focus:outline-none focus:border-[#032031] text-black font-medium"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black">
                        Corporate Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        placeholder="marcus.vance@fortress-asr.com"
                        className="px-3.5 py-2.5 text-xs border border-black/20 rounded-xl focus:outline-none focus:border-[#032031] text-black font-medium"
                      />
                    </div>

                    {/* Phone Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black">
                        Contact Phone (Optional)
                      </label>
                      <input
                        type="text"
                        value={inviteForm.phoneNumber || ''}
                        onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })}
                        placeholder="+44 7700 900077"
                        className="px-3.5 py-2.5 text-xs border border-black/20 rounded-xl focus:outline-none focus:border-[#032031] text-black font-medium"
                      />
                    </div>

                    {/* Appointment & Department */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black">
                          Official Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteForm.jobTitle}
                          onChange={(e) => setInviteForm({ ...inviteForm, jobTitle: e.target.value })}
                          placeholder="e.g. Duty Dispatcher"
                          className="px-3.5 py-2.5 text-xs border border-black/20 rounded-xl focus:outline-none focus:border-[#032031] text-black font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black">
                          Department
                        </label>
                        <input
                          type="text"
                          value={inviteForm.department || ''}
                          onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                          placeholder="e.g. Operations"
                          className="px-3.5 py-2.5 text-xs border border-black/20 rounded-xl focus:outline-none focus:border-[#032031] text-black font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Access Templates */}
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#032031]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                        2. Access Template
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-black/50">
                      Role: Operations Supervisor
                    </span>
                  </div>

                  {/* Preset Template Cards */}
                  <div className="flex-1 flex flex-col justify-between gap-2.5">
                    {PRESET_TEMPLATES.filter((t) => t.id !== 'CUSTOM').map((tpl) => {
                      const isSelected = inviteForm.template === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => setInviteForm({ ...inviteForm, template: tpl.id })}
                          className={`flex-1 p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-center gap-1 ${
                            isSelected
                              ? 'border-black bg-slate-50/80 ring-1 ring-black shadow-2xs'
                              : 'border-black/15 hover:border-black/40 hover:bg-black/[0.01]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                                isSelected ? 'border-[#032031] bg-[#032031]' : 'border-black/30'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="font-black text-xs text-[#032031]">{tpl.name}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tpl.badgeClass}`}>
                                {tpl.shortName}
                              </span>
                            </div>

                            <span className="text-[10px] text-black/50 font-bold shrink-0">
                              {schema?.templates[tpl.id]?.length || 0} permissions
                            </span>
                          </div>

                          <p className="text-[11px] text-black/60 font-medium truncate pl-6.5">
                            {tpl.description}
                          </p>
                        </div>
                      );
                    })}

                    {/* Custom Template Card */}
                    <div
                      onClick={() => setInviteForm({ ...inviteForm, template: 'CUSTOM' })}
                      className={`flex-1 p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-center gap-1 ${
                        inviteForm.template === 'CUSTOM'
                          ? 'border-black bg-purple-50/40 ring-1 ring-black shadow-2xs'
                          : 'border-black/15 hover:border-black/40 hover:bg-black/[0.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                            inviteForm.template === 'CUSTOM' ? 'border-purple-700 bg-purple-700' : 'border-black/30'
                          }`}>
                            {inviteForm.template === 'CUSTOM' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-black text-xs text-[#032031]">Custom Permissions Checklist</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-purple-50 text-purple-800 border-purple-300">
                            Custom
                          </span>
                        </div>

                        <span className="text-[10px] text-purple-800 font-bold shrink-0">
                          {inviteForm.permissions?.length || 0} selected
                        </span>
                      </div>

                      <p className="text-[11px] text-black/60 font-medium truncate pl-6.5">
                        Configure granular switches via full-width matrix below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Full-Width Bottom Section: Custom Permissions Matrix (Covers both left & right) */}
              {inviteForm.template === 'CUSTOM' && (
                <div className="w-full flex flex-col gap-4 pt-6 border-t border-black/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#032031]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                        3. Granular Capabilities Matrix ({inviteForm.permissions?.length || 0} Permissions Selected)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = schema?.availablePermissions.map((p) => p.id) || [];
                          setInviteForm({ ...inviteForm, permissions: allIds });
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-[#032031] bg-[#032031]/5 hover:bg-[#032031] hover:text-white rounded-lg border border-[#032031]/20 transition cursor-pointer"
                      >
                        Select All (22)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInviteForm({ ...inviteForm, permissions: [] })}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg border border-red-200 transition cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* 3-Column Full-Width Category Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="bg-slate-50/70 border border-black/15 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-black/10 pb-2">
                          <span className="text-xs font-black uppercase text-[#032031] tracking-wider">
                            {category}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              toggleCategoryPermissions(
                                perms,
                                inviteForm.permissions || [],
                                (l) => setInviteForm({ ...inviteForm, permissions: l })
                              )
                            }
                            className="text-[11px] font-bold text-[#032031] hover:underline cursor-pointer"
                          >
                            Toggle Category
                          </button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {perms.map((p) => {
                            const checked = (inviteForm.permissions || []).includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition cursor-pointer select-none ${
                                  checked
                                    ? 'bg-white border-black/30 shadow-2xs'
                                    : 'bg-white/60 border-black/10 hover:border-black/25 hover:bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    togglePermission(
                                      p.id,
                                      inviteForm.permissions || [],
                                      (l) => setInviteForm({ ...inviteForm, permissions: l })
                                    )
                                  }
                                  className="w-4 h-4 rounded text-[#032031] accent-[#032031] cursor-pointer shrink-0"
                                />
                                <span className="text-xs sm:text-[13px] font-bold text-black leading-snug">
                                  {p.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-black/10 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-black/60 font-semibold text-center sm:text-left">
                Assigned: <strong className="text-[#032031]">{inviteForm.jobTitle || 'Operations Staff'}</strong> • Template:{' '}
                <strong className="text-[#032031]">
                  {PRESET_TEMPLATES.find((t) => t.id === inviteForm.template)?.name || 'Custom'}
                </strong>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-black/25 text-black text-xs font-bold rounded-xl hover:bg-black/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="invite-staff-form"
                  disabled={inviteSubmitting}
                  className="px-5 py-2 bg-[#032031] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{inviteSubmitting ? 'Dispatching Invite...' : 'Send Secure Invitation'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT PERMISSIONS MODAL (Wide Full-Width Panel)  */}
      {/* ======================================================== */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-5xl w-full flex flex-col shadow-2xl my-auto max-h-[92vh] text-black overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-black/10 shrink-0 bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#032031] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
                    Personnel Access Governance
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-[#032031] tracking-tight">
                    Edit Role & Permissions: {editingStaff.firstName} {editingStaff.lastName}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-2 rounded-xl hover:bg-black/5 text-black/60 hover:text-black transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form id="edit-staff-form" onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
              {/* In-Modal Error Alert Banner */}
              {editError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-red-700 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-red-800">
                        Update Failed
                      </span>
                      <span className="text-xs font-semibold leading-relaxed text-red-700">
                        {editError}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditError(null)}
                    className="p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-700 transition cursor-pointer shrink-0"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Top 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Staff Details & Summary */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-black/10">
                    <Users className="w-4 h-4 text-[#032031]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                      1. Staff Appointment Details
                    </h3>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-black/50 font-bold uppercase text-[10px]">Email</span>
                      <span className="font-semibold text-black">{editingStaff.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black/50 font-bold uppercase text-[10px]">Account Role</span>
                      <span className="font-bold text-black uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-slate-300">
                        {editingStaff.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black">
                        Job Title / Appointment
                      </label>
                      <input
                        type="text"
                        value={editJobTitle}
                        onChange={(e) => setEditJobTitle(e.target.value)}
                        className="px-3.5 py-2.5 text-xs border border-black/20 rounded-xl focus:outline-none focus:border-[#032031] text-black font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="px-3.5 py-2.5 text-xs border border-black/20 rounded-xl focus:outline-none focus:border-[#032031] text-black font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Template Picker */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#032031]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                        2. Operational Template
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-black/50">
                      Preset or Custom
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between gap-2.5">
                    {PRESET_TEMPLATES.filter((t) => t.id !== 'CUSTOM').map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => setEditTemplate(tpl.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-center gap-1 ${
                          editTemplate === tpl.id
                            ? 'border-black bg-slate-50 ring-1 ring-black shadow-2xs'
                            : 'border-black/15 hover:border-black/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#032031]">{tpl.name}</span>
                          {editTemplate === tpl.id && (
                            <CheckCircle2 className="w-4 h-4 text-[#032031]" />
                          )}
                        </div>
                        <p className="text-[11px] text-black/60 font-medium truncate">
                          {tpl.description}
                        </p>
                      </div>
                    ))}

                    <div
                      onClick={() => setEditTemplate('CUSTOM')}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        editTemplate === 'CUSTOM'
                          ? 'border-black bg-purple-50/50 ring-1 ring-black shadow-2xs'
                          : 'border-black/15 hover:border-black/40'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#032031]">Custom Permissions Checklist</span>
                        <span className="text-[11px] text-black/60 font-medium truncate">
                          Configure granular switches via full-width matrix below.
                        </span>
                      </div>
                      {editTemplate === 'CUSTOM' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Width Bottom Section: Custom Permissions Matrix (Covers both left & right) */}
              {editTemplate === 'CUSTOM' && (
                <div className="w-full flex flex-col gap-4 pt-6 border-t border-black/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#032031]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#032031]">
                        3. Granular Capabilities Matrix ({editPermissions.length} Permissions Selected)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = schema?.availablePermissions.map((p) => p.id) || [];
                          setEditPermissions(allIds);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-[#032031] bg-[#032031]/5 hover:bg-[#032031] hover:text-white rounded-lg border border-[#032031]/20 transition cursor-pointer"
                      >
                        Select All (22)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditPermissions([])}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg border border-red-200 transition cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* 3-Column Full-Width Category Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="bg-slate-50/70 border border-black/15 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-black/10 pb-2">
                          <span className="text-xs font-black uppercase text-[#032031] tracking-wider">
                            {category}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              toggleCategoryPermissions(
                                perms,
                                editPermissions,
                                setEditPermissions
                              )
                            }
                            className="text-[11px] font-bold text-[#032031] hover:underline cursor-pointer"
                          >
                            Toggle Category
                          </button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {perms.map((p) => {
                            const checked = editPermissions.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition cursor-pointer select-none ${
                                  checked
                                    ? 'bg-white border-black/30 shadow-2xs'
                                    : 'bg-white/60 border-black/10 hover:border-black/25 hover:bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    togglePermission(p.id, editPermissions, setEditPermissions)
                                  }
                                  className="w-4 h-4 rounded text-[#032031] accent-[#032031] cursor-pointer shrink-0"
                                />
                                <span className="text-xs sm:text-[13px] font-bold text-black leading-snug">
                                  {p.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-black/10 bg-zinc-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="px-4 py-2 border border-black/25 text-black text-xs font-bold rounded-xl hover:bg-black/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-staff-form"
                disabled={editSubmitting}
                className="px-5 py-2 bg-[#032031] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{editSubmitting ? 'Saving Changes...' : 'Save Permissions'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: STATUS TOGGLE CONFIRMATION                      */}
      {/* ======================================================== */}
      {statusActionTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl text-black">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                statusActionTarget.isActive ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {statusActionTarget.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-black text-black">
                  {statusActionTarget.isActive ? 'Deactivate Staff Account' : 'Reactivate Staff Account'}
                </h3>
                <span className="text-xs text-black/60">
                  {statusActionTarget.firstName} {statusActionTarget.lastName} ({statusActionTarget.email})
                </span>
              </div>
            </div>

            <p className="text-xs text-black/70 font-semibold leading-relaxed">
              {statusActionTarget.isActive
                ? 'Deactivating this user will revoke their access to the Security Operations Command Center immediately.'
                : 'Reactivating this user will restore their operational permissions and allow them to log into the command center.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setStatusActionTarget(null)}
                className="px-4 py-2 border border-black/25 text-black text-xs font-bold rounded-xl hover:bg-black/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusActionSubmitting}
                className={`px-5 py-2 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50 ${
                  statusActionTarget.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusActionSubmitting
                  ? 'Updating...'
                  : statusActionTarget.isActive
                  ? 'Confirm Deactivation'
                  : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CONFIRM DELETE EMPLOYEE MODAL                   */}
      {/* ======================================================== */}
      {deleteTargetStaff && (() => {
        const targetFullName = `${deleteTargetStaff.firstName} ${deleteTargetStaff.lastName}`.trim() || deleteTargetStaff.email;
        const isNameMatching = confirmNameInput.trim().toLowerCase() === targetFullName.toLowerCase();

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
            <div className="bg-white border border-black rounded-2xl max-w-lg w-full p-6 sm:p-7 flex flex-col gap-5 shadow-2xl text-black">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
                      Permanent Deletion
                    </span>
                    <h3 className="text-lg font-black text-black">
                      Delete Employee Account
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTargetStaff(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5 text-black/50 hover:text-black transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* In-Modal Error Banner */}
              {deleteError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 animate-fade-in text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="font-semibold">{deleteError}</span>
                </div>
              )}

              {/* Employee Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-black/10 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-black/50 font-bold uppercase text-[10px]">Staff Member</span>
                  <span className="font-black text-black">{targetFullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/50 font-bold uppercase text-[10px]">Email</span>
                  <span className="font-semibold text-black/80">{deleteTargetStaff.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/50 font-bold uppercase text-[10px]">Appointment</span>
                  <span className="font-bold text-[#032031]">
                    {deleteTargetStaff.staffProfile?.jobTitle || 'Operations Supervisor'}
                  </span>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  This action is <strong>permanent and irreversible</strong>. The employee&apos;s system profile, roles, credentials, and access permissions will be permanently purged.
                </p>
              </div>

              {/* Confirmation Input Form */}
              <form onSubmit={handleDeleteStaff} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-black leading-snug">
                    To confirm deletion, please enter the employee name{' '}
                    <span className="font-black text-red-600 select-all">&ldquo;{targetFullName}&rdquo;</span> below:
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmNameInput}
                    onChange={(e) => {
                      setConfirmNameInput(e.target.value);
                      if (deleteError) setDeleteError(null);
                    }}
                    placeholder={`Type "${targetFullName}"`}
                    className="px-3.5 py-2.5 text-xs bg-white border border-black/20 focus:border-red-600 rounded-xl focus:outline-none text-black font-semibold"
                    autoFocus
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetStaff(null)}
                    className="px-4 py-2 border border-black/20 hover:bg-black/5 rounded-xl text-xs font-bold text-black transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isNameMatching || deleteSubmitting}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deleteSubmitting ? 'Deleting...' : 'Permanently Delete Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
