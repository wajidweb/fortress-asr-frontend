'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  clientService, 
  SiteServiceRequest, 
  ServiceRequestStatus, 
  ServiceRequestUrgency, 
  ServiceRequestType,
  CreateSiteServiceRequestPayload 
} from '@/services/client.service';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  X, 
  Building2, 
  MapPin, 
  Shield, 
  Calendar, 
  Users, 
  Eye, 
  Send, 
  AlertTriangle, 
  Info,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Phone, 
  FileText, 
  Compass, 
  AlertCircle,
  Check,
  Pencil,
  RotateCw
} from 'lucide-react';

interface SiteRequestsProps {
  onNavigateToSites?: () => void;
}

export const SiteRequests: React.FC<SiteRequestsProps> = ({ onNavigateToSites }) => {
  const addToast = useUIStore((state) => state.addToast);

  // Data & loading states
  const [requests, setRequests] = useState<SiteServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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
    pendingReview: 0,
    underAssessment: 0,
    approved: 0,
  });

  // Filters
  const [activeTab, setActiveTab] = useState<'ALL' | ServiceRequestStatus>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | ServiceRequestUrgency>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SiteServiceRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<SiteServiceRequest | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<SiteServiceRequest | null>(null);

  // Form State
  const initialFormState: CreateSiteServiceRequestPayload = {
    type: 'NEW_SITE_DEPLOYMENT',
    urgency: 'STANDARD',
    propertyName: '',
    propertyAddress: '',
    city: '',
    postcode: '',
    suggestedLatitude: null,
    suggestedLongitude: null,
    requiredGuardsCount: 1,
    serviceStartDate: '',
    serviceEndDate: '',
    shiftScheduleNotes: '',
    specialInstructions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  };
  const [formData, setFormData] = useState<CreateSiteServiceRequestPayload>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Preferred Shift Schedule Dropdown & Time Picker States
  const [scheduleDaysPreset, setScheduleDaysPreset] = useState<string>('ALL_DAYS');
  const [customDays, setCustomDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [scheduleHoursPreset, setScheduleHoursPreset] = useState<string>('NIGHT_19_07');
  const [customStartTime, setCustomStartTime] = useState<string>('19:00');
  const [customEndTime, setCustomEndTime] = useState<string>('07:00');
  const [extraScheduleNote, setExtraScheduleNote] = useState<string>('');

  // Automatically compile days and time selections into shiftScheduleNotes
  useEffect(() => {
    let daysLabel = 'All Days (Monday - Sunday)';
    if (scheduleDaysPreset === 'WEEKDAYS') {
      daysLabel = 'Weekdays (Monday - Friday)';
    } else if (scheduleDaysPreset === 'WEEKENDS') {
      daysLabel = 'Weekends (Saturday - Sunday)';
    } else if (scheduleDaysPreset === 'CUSTOM') {
      daysLabel = customDays.length > 0 ? customDays.join(', ') : 'Selected Days';
    }

    let hoursLabel = 'Night Watch (19:00 - 07:00)';
    if (scheduleHoursPreset === '24_HOURS') {
      hoursLabel = '24/7 Continuous Coverage';
    } else if (scheduleHoursPreset === 'DAY_07_19') {
      hoursLabel = 'Day Shift (07:00 - 19:00)';
    } else if (scheduleHoursPreset === 'BUSINESS_08_18') {
      hoursLabel = 'Business Hours (08:00 - 18:00)';
    } else if (scheduleHoursPreset === 'EVENING_18_00') {
      hoursLabel = 'Evening Coverage (18:00 - 00:00)';
    } else if (scheduleHoursPreset === 'CUSTOM') {
      hoursLabel = `Custom Hours (${customStartTime} - ${customEndTime})`;
    }

    const compiled = extraScheduleNote.trim() 
      ? `${daysLabel}: ${hoursLabel} (${extraScheduleNote.trim()})`
      : `${daysLabel}: ${hoursLabel}`;

    setFormData((prev) => ({
      ...prev,
      shiftScheduleNotes: compiled,
    }));
  }, [scheduleDaysPreset, customDays, scheduleHoursPreset, customStartTime, customEndTime, extraScheduleNote]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientService.getRequests({
        status: activeTab === 'ALL' ? undefined : activeTab,
        urgency: urgencyFilter === 'ALL' ? undefined : urgencyFilter,
        search: searchQuery.trim() || undefined,
        page,
        limit,
      });

      setRequests(res.requests || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
      if (res.stats) {
        setStats(res.stats);
      }

      if (selectedRequest) {
        const fresh = (res.requests || []).find((r) => r.id === selectedRequest.id);
        if (fresh) setSelectedRequest(fresh);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to load site service requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, urgencyFilter, searchQuery, page, limit, selectedRequest, addToast]);

  useEffect(() => {
    loadRequests();
  }, [activeTab, urgencyFilter, page, limit]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadRequests();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadRequests();
      addToast('Service requests refreshed with latest updates', 'success');
    } catch {
      // loadRequests already handles error toast
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'requiredGuardsCount' ? Math.max(1, parseInt(value, 10) || 1) : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Property & Location Details
    if (!formData.propertyName.trim()) {
      errors.propertyName = 'Property / site name is required';
    } else if (formData.propertyName.trim().length < 3) {
      errors.propertyName = 'Property name must be at least 3 characters';
    }

    if (!formData.propertyAddress.trim()) {
      errors.propertyAddress = 'Physical street address is required';
    }

    if (!formData.city || !formData.city.trim()) {
      errors.city = 'City / town is required';
    }

    if (!formData.postcode || !formData.postcode.trim()) {
      errors.postcode = 'Postcode is required';
    }

    // 2. Deployment Specifications
    if (!formData.requiredGuardsCount || formData.requiredGuardsCount < 1) {
      errors.requiredGuardsCount = 'At least 1 security officer is required';
    }

    if (!formData.serviceStartDate) {
      errors.serviceStartDate = 'Service start date is required';
    }

    if (!formData.serviceEndDate) {
      errors.serviceEndDate = 'Contract end date is required';
    } else if (formData.serviceStartDate && formData.serviceEndDate < formData.serviceStartDate) {
      errors.serviceEndDate = 'Contract end date cannot be earlier than start date';
    }

    if (!formData.shiftScheduleNotes || !formData.shiftScheduleNotes.trim()) {
      errors.shiftScheduleNotes = 'Operating shift schedule is required';
    }

    // 3. Emergency Contacts & Standing Instructions
    if (!formData.emergencyContactName || !formData.emergencyContactName.trim()) {
      errors.emergencyContactName = 'On-site emergency contact name is required';
    }

    if (!formData.emergencyContactPhone || !formData.emergencyContactPhone.trim()) {
      errors.emergencyContactPhone = 'Emergency contact phone number is required';
    } else if (formData.emergencyContactPhone.trim().length < 7) {
      errors.emergencyContactPhone = 'Please enter a valid phone number (at least 7 digits)';
    }

    if (!formData.specialInstructions || !formData.specialInstructions.trim()) {
      errors.specialInstructions = 'Site instructions or known hazard details are required';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      addToast('Please complete all required fields marked in red.', 'error');
    }
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setEditingRequest(null);
    setFormData(initialFormState);
    setScheduleDaysPreset('ALL_DAYS');
    setCustomDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setScheduleHoursPreset('NIGHT_19_07');
    setCustomStartTime('19:00');
    setCustomEndTime('07:00');
    setExtraScheduleNote('');
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (req: SiteServiceRequest) => {
    if (req.status !== 'PENDING_REVIEW') {
      addToast(`Cannot edit request: this request is already ${req.status.toLowerCase().replace('_', ' ')} and locked from modification.`, 'error');
      return;
    }

    setEditingRequest(req);

    const rawNotes = req.shiftScheduleNotes || '';
    if (rawNotes.includes('Weekdays (Monday - Friday)')) {
      setScheduleDaysPreset('WEEKDAYS');
    } else if (rawNotes.includes('Weekends (Saturday - Sunday)')) {
      setScheduleDaysPreset('WEEKENDS');
    } else if (rawNotes.includes('All Days (Monday - Sunday)')) {
      setScheduleDaysPreset('ALL_DAYS');
    } else {
      setScheduleDaysPreset('CUSTOM');
    }

    if (rawNotes.includes('24/7 Continuous Coverage')) {
      setScheduleHoursPreset('24_HOURS');
    } else if (rawNotes.includes('Day Shift (07:00 - 19:00)')) {
      setScheduleHoursPreset('DAY_07_19');
    } else if (rawNotes.includes('Business Hours (08:00 - 18:00)')) {
      setScheduleHoursPreset('BUSINESS_08_18');
    } else if (rawNotes.includes('Evening Coverage (18:00 - 00:00)')) {
      setScheduleHoursPreset('EVENING_18_00');
    } else if (rawNotes.includes('Night Watch (19:00 - 07:00)')) {
      setScheduleHoursPreset('NIGHT_19_07');
    } else {
      setScheduleHoursPreset('CUSTOM');
    }

    const noteMatch = rawNotes.match(/\(([^()]+)\)$/);
    if (noteMatch) {
      setExtraScheduleNote(noteMatch[1]);
    } else if (!rawNotes.includes('Shift') && !rawNotes.includes('Coverage') && !rawNotes.includes('Hours')) {
      setExtraScheduleNote(rawNotes);
    } else {
      setExtraScheduleNote('');
    }

    setFormData({
      type: req.type,
      urgency: req.urgency,
      propertyName: req.propertyName,
      propertyAddress: req.propertyAddress,
      city: req.city || '',
      postcode: req.postcode || '',
      suggestedLatitude: req.suggestedLatitude !== undefined && req.suggestedLatitude !== null ? Number(req.suggestedLatitude) : null,
      suggestedLongitude: req.suggestedLongitude !== undefined && req.suggestedLongitude !== null ? Number(req.suggestedLongitude) : null,
      requiredGuardsCount: req.requiredGuardsCount,
      serviceStartDate: req.serviceStartDate ? req.serviceStartDate.split('T')[0] : '',
      serviceEndDate: req.serviceEndDate ? req.serviceEndDate.split('T')[0] : '',
      shiftScheduleNotes: req.shiftScheduleNotes || '',
      specialInstructions: req.specialInstructions || '',
      emergencyContactName: req.emergencyContactName || '',
      emergencyContactPhone: req.emergencyContactPhone || '',
      siteId: req.siteId || null,
    });

    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingRequest(null);
    setFormData(initialFormState);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingRequest) {
        await clientService.updateRequest(editingRequest.id, {
          ...formData,
          serviceEndDate: formData.serviceEndDate ? formData.serviceEndDate : null,
          suggestedLatitude: formData.suggestedLatitude ? Number(formData.suggestedLatitude) : null,
          suggestedLongitude: formData.suggestedLongitude ? Number(formData.suggestedLongitude) : null,
        });
        addToast('Site service deployment request updated successfully!', 'success');
        setEditingRequest(null);
      } else {
        await clientService.createRequest({
          ...formData,
          serviceEndDate: formData.serviceEndDate ? formData.serviceEndDate : null,
          suggestedLatitude: formData.suggestedLatitude ? Number(formData.suggestedLatitude) : null,
          suggestedLongitude: formData.suggestedLongitude ? Number(formData.suggestedLongitude) : null,
        });
        addToast('Site service deployment request submitted successfully!', 'success');
        setPage(1);
      }
      setIsCreateModalOpen(false);
      setFormData(initialFormState);
      await loadRequests();
    } catch (err: any) {
      addToast(err.message || (editingRequest ? 'Failed to update site request' : 'Failed to submit site request'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCancelModal = (req: SiteServiceRequest) => {
    setRequestToCancel(req);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!requestToCancel) return;
    setCancellingId(requestToCancel.id);
    try {
      await clientService.cancelRequest(requestToCancel.id);
      addToast('Site service request cancelled successfully', 'success');
      if (selectedRequest?.id === requestToCancel.id) {
        setSelectedRequest(null);
      }
      setIsCancelModalOpen(false);
      setRequestToCancel(null);
      await loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel request', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: ServiceRequestStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
      case 'UNDER_ASSESSMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-300">
            <Shield className="w-3 h-3 text-blue-600" />
            Under Assessment
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved & Deployed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-800 border border-red-300">
            <XCircle className="w-3 h-3 text-red-600" />
            Declined
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300">
            <X className="w-3 h-3 text-zinc-500" />
            Cancelled
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: ServiceRequestUrgency) => {
    switch (urgency) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-red-600 text-white animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" />
            Emergency (&lt;24h)
          </span>
        );
      case 'PRIORITY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-500 text-white">
            Priority (24-48h)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-black/5 text-black/70 border border-black/10">
            Standard
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* 1. Action Header Controls (Fully Responsive across all viewports) */}
      <div className="w-full flex items-center justify-end">
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 border border-black hover:border-black text-[#032031] hover:bg-black/5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-[0.98] shrink-0"
            title="Refresh service requests with latest data"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#032031] ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Request New Site Coverage Button */}
          <button
            onClick={handleOpenCreateModal}
            className="flex-[2] sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 bg-[#032031] hover:bg-black text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow cursor-pointer active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Request New Site Coverage</span>
            <span className="sm:hidden">Request Site Coverage</span>
          </button>

        </div>
      </div>

      {/* 2. Redesigned 4 KPI Cards: Total Requests, Pending Review, Under Assessment, Approved & Deployed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Requests */}
        <div className="bg-white border border-black rounded-xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
              Total Requests
            </span>
            <span className="text-3xl font-black text-[#032031]">
              {stats.total}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#032031] text-white flex items-center justify-center shadow-inner shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div className="bg-white border border-amber-300 rounded-xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition bg-gradient-to-br from-amber-50/60 to-white">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
              Pending Review
            </span>
            <span className="text-3xl font-black text-amber-700">
              {stats.pendingReview}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-inner shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Under Assessment */}
        <div className="bg-white border border-blue-300 rounded-xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition bg-gradient-to-br from-blue-50/60 to-white">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">
              Under Assessment
            </span>
            <span className="text-3xl font-black text-blue-700">
              {stats.underAssessment}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-inner shrink-0">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Approved & Deployed */}
        <div className="bg-white border border-emerald-300 rounded-xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition bg-gradient-to-br from-emerald-50/60 to-white">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Approved & Deployed
            </span>
            <span className="text-3xl font-black text-emerald-700">
              {stats.approved}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-inner shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Table & Controls Card */}
      <div className="bg-white border border-black rounded-xl flex flex-col overflow-hidden shadow-xs">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-black/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50/70">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Requests' },
              { id: 'PENDING_REVIEW', label: 'Pending Review' },
              { id: 'UNDER_ASSESSMENT', label: 'Assessing' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Declined' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer
                  ${activeTab === tab.id 
                    ? 'bg-[#032031] text-white shadow-xs' 
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Urgency Filters */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Urgency select */}
            <select
              value={urgencyFilter}
              onChange={(e) => {
                setUrgencyFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-1.5 border border-black/30 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="ALL">All Urgencies</option>
              <option value="STANDARD">Standard</option>
              <option value="PRIORITY">Priority (24-48h)</option>
              <option value="EMERGENCY">Emergency (&lt;24h)</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search property or location..."
                className="w-full pl-8 pr-3 py-1.5 border border-black/30 rounded-lg text-xs font-medium focus:outline-none focus:border-black bg-white"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/40" />
            </div>

            {/* Quick Refresh Icon */}
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="p-1.5 border border-black/30 hover:border-black rounded-lg text-[#032031] hover:bg-black/5 transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Refresh requests list"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            </button>

          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <LoaderRectangle />
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Loading site service requests...
            </span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4 gap-3">
            <Building2 className="w-10 h-10 text-black/20" />
            <h3 className="text-sm font-black text-black uppercase tracking-wider">No service requests found</h3>
            <p className="text-xs text-black/60 max-w-md font-medium">
              {searchQuery 
                ? 'No requests matched your search criteria.'
                : 'You have not submitted any site deployment requests under this filter category yet.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#032031] text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-black transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit First Request
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02] text-[9px] font-black uppercase tracking-wider text-black/60">
                  <th className="py-3 px-4">Property / Deployment</th>
                  <th className="py-3 px-4">Coverage Type</th>
                  <th className="py-3 px-4">Officers</th>
                  <th className="py-3 px-4">Target Start</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-black/[0.015] transition">
                    
                    {/* Property info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#032031] text-xs">{req.propertyName}</span>
                          {getUrgencyBadge(req.urgency)}
                        </div>
                        <div className="flex items-center gap-1.5 text-black/60 text-[11px]">
                          <MapPin className="w-3 h-3 text-black/40 shrink-0" />
                          <span className="truncate max-w-xs">{req.propertyAddress}</span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 text-black/80 font-bold text-[11px]">
                      {req.type === 'NEW_SITE_DEPLOYMENT' && 'New Site Deployment'}
                      {req.type === 'EXTRA_GUARD_COVERAGE' && 'Extra Officer Manning'}
                      {req.type === 'SCHEDULE_CHANGE' && 'Schedule Modification'}
                      {req.type === 'SPECIAL_EVENT' && 'Special Event Security'}
                    </td>

                    {/* Guards Count */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-black text-xs">
                        <Users className="w-3.5 h-3.5 text-black/50" />
                        {req.requiredGuardsCount} {req.requiredGuardsCount === 1 ? 'Officer' : 'Officers'}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 text-black/80 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3 h-3 text-black/40" />
                        {new Date(req.serviceStartDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1.5 rounded-lg border border-black/30 hover:border-black hover:bg-black/5 text-[#032031] text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                        >
                          View Details
                        </button>
                        {req.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(req)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-black/25 hover:border-black hover:bg-black/5 text-[#032031] text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                              title="Edit pending request"
                            >
                              <Pencil className="w-3 h-3 text-[#032031]" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenCancelModal(req)}
                              disabled={cancellingId === req.id}
                              className="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Proper Responsive Pagination Bar */}
        <div className="p-4 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/70 text-xs">
          
          {/* Entries Indicator */}
          <div className="flex items-center gap-3">
            <span className="text-black/60 font-semibold text-[11px]">
              Showing {pagination.total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} requests
            </span>

            {/* Per page selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-black/40 uppercase">Rows:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-0.5 border border-black/20 rounded text-xs font-bold bg-white focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Page Switcher */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-black/20 hover:border-black hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
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
                    className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer
                      ${page === p
                        ? 'bg-[#032031] text-white shadow-xs'
                        : 'border border-black/20 hover:border-black hover:bg-black/5 text-black'
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
              className="p-1.5 rounded-lg border border-black/20 hover:border-black hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>

        </div>

      </div>

      {/* 5. SECURITY DEPLOYMENT REQUEST MODAL - PLATFORM BRAND SYSTEM */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-black overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-black/10 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#032031] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg sm:text-xl font-black text-[#032031] tracking-tight">
                    {editingRequest ? 'Edit Site Service Request' : 'Request Security Deployment'}
                  </h2>
                  <p className="text-xs text-black/60 font-semibold">
                    {editingRequest
                      ? 'Update property details, personnel count, and deployment schedule'
                      : 'Submit property location and officer requirements for operational risk review'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-xl border border-black/15 text-black/60 hover:text-black hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form id="create-request-form" onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
              
              <div className="flex-grow overflow-y-auto px-6 sm:px-8 py-6 flex flex-col gap-6 text-sm">
                
                {/* Platform Info Banner */}
                <div className="bg-[#032031]/5 border border-[#032031]/15 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#032031] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#032031] leading-relaxed font-semibold">
                    {editingRequest
                      ? 'Editing is permitted while your request is pending operational review. Any changes will immediately update the deployment specifications in the SOC queue.'
                      : 'Upon submission, our Security Operations Centre (SOC) assesses site accessibility, establishes circular GPS geofencing, and assigns licensed SIA security officers.'}
                  </p>
                </div>

                {/* Section 1: Property Location Card */}
                <div className="border border-black/15 rounded-xl p-5 bg-white flex flex-col gap-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#032031] font-black text-xs uppercase tracking-wider border-b border-black/10 pb-2.5">
                    <MapPin className="w-4 h-4 text-[#032031]" />
                    <span>Property & Location</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-[#032031]">
                        Property / Site Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="propertyName"
                        value={formData.propertyName}
                        onChange={handleInputChange}
                        placeholder="e.g. Atlantic Hub - Warehouse C"
                        className={`h-10 px-3.5 border rounded-lg text-xs font-semibold text-[#032031] bg-white placeholder:text-black/50 focus:outline-none transition-all ${
                          formErrors.propertyName
                            ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                        }`}
                      />
                      {formErrors.propertyName && (
                        <span className="text-xs text-red-600 font-bold">{formErrors.propertyName}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-[#032031]">
                        Physical Street Address <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        name="propertyAddress"
                        value={formData.propertyAddress}
                        onChange={handleInputChange}
                        placeholder="Full street address and building number..."
                        className={`p-3 border rounded-lg text-xs font-semibold text-[#032031] bg-white placeholder:text-black/50 focus:outline-none resize-none transition-all ${
                          formErrors.propertyAddress
                            ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                        }`}
                      />
                      {formErrors.propertyAddress && (
                        <span className="text-xs text-red-600 font-bold">{formErrors.propertyAddress}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#032031]">
                        City / Town <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. London"
                        className={`h-10 px-3.5 border rounded-lg text-xs font-semibold text-[#032031] bg-white placeholder:text-black/50 focus:outline-none transition-all ${
                          formErrors.city
                            ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                        }`}
                      />
                      {formErrors.city && (
                        <span className="text-xs text-red-600 font-bold">{formErrors.city}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#032031]">
                        Postcode <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={formData.postcode || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. SE1 2UP"
                        className={`h-10 px-3.5 border rounded-lg text-xs font-semibold text-[#032031] bg-white placeholder:text-black/50 focus:outline-none transition-all ${
                          formErrors.postcode
                            ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                        }`}
                      />
                      {formErrors.postcode && (
                        <span className="text-xs text-red-600 font-bold">{formErrors.postcode}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Security & Manning Requirements Card */}
                <div className="border border-black/15 rounded-xl p-5 bg-white flex flex-col gap-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#032031] font-black text-xs uppercase tracking-wider border-b border-black/10 pb-2.5">
                    <Shield className="w-4 h-4 text-[#032031]" />
                    <span>Deployment Specifications</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Coverage Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#032031]">Coverage Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="h-10 px-3 border border-black/25 rounded-lg text-xs font-semibold text-[#032031] bg-white focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] cursor-pointer"
                      >
                        <option value="NEW_SITE_DEPLOYMENT">New Site Deployment</option>
                        <option value="EXTRA_GUARD_COVERAGE">Extra Guard Coverage</option>
                        <option value="SCHEDULE_CHANGE">Schedule Change</option>
                        <option value="SPECIAL_EVENT">Special Event Security</option>
                      </select>
                    </div>

                    {/* Officer Count */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#032031]">
                        Officers Needed <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          name="requiredGuardsCount"
                          value={formData.requiredGuardsCount}
                          onChange={handleInputChange}
                          className="h-10 w-full pl-9 pr-3 border border-black/25 rounded-lg text-xs font-black text-[#032031] bg-white focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031]"
                        />
                        <Users className="w-4 h-4 text-[#032031] absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Service Start Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#032031]">
                        Service Start Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="serviceStartDate"
                        value={formData.serviceStartDate}
                        onChange={handleInputChange}
                        className={`h-10 px-3 border rounded-lg text-xs font-semibold text-[#032031] bg-white focus:outline-none transition-all ${
                          formErrors.serviceStartDate
                            ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                        }`}
                      />
                      {formErrors.serviceStartDate && (
                        <span className="text-xs text-red-600 font-bold">{formErrors.serviceStartDate}</span>
                      )}
                    </div>

                  </div>

                  {/* Urgency Selector - Platform Styled Chips */}
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="text-xs font-bold text-[#032031]">Deployment Urgency</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'STANDARD', label: 'Standard', desc: '> 48 hours notice' },
                        { id: 'PRIORITY', label: 'Priority', desc: '24 - 48 hours notice' },
                        { id: 'EMERGENCY', label: 'Emergency', desc: '< 24 hours urgent' },
                      ].map((item) => {
                        const isSelected = formData.urgency === item.id;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setFormData({ ...formData, urgency: item.id as any })}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                              isSelected
                                ? 'border border-[#032031] bg-[#032031] text-white shadow-xs'
                                : 'border border-black/20 hover:border-black/50 bg-white text-black'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-[#032031]'}`}>
                                {item.label}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                            </div>
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-black/60'}`}>
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Shift Schedule - Interactive Days & Hours Dropdowns */}
                  <div className="pt-2 border-t border-black/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#032031] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#032031]" />
                        Preferred Shift Schedule
                      </span>
                      <span className="text-[10px] text-black/50 font-medium">Select coverage days & timing</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Days Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#032031]">Operating Days</label>
                        <select
                          value={scheduleDaysPreset}
                          onChange={(e) => setScheduleDaysPreset(e.target.value)}
                          className="h-10 px-3 border border-black/25 rounded-lg text-xs font-semibold text-[#032031] bg-white focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] cursor-pointer"
                        >
                          <option value="ALL_DAYS">All Days (Monday - Sunday, 7 Days)</option>
                          <option value="WEEKDAYS">Weekdays Only (Monday - Friday)</option>
                          <option value="WEEKENDS">Weekends Only (Saturday - Sunday)</option>
                          <option value="CUSTOM">Custom Selected Days...</option>
                        </select>
                      </div>

                      {/* Hours Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#032031]">Shift Timing / Hours</label>
                        <select
                          value={scheduleHoursPreset}
                          onChange={(e) => setScheduleHoursPreset(e.target.value)}
                          className="h-10 px-3 border border-black/25 rounded-lg text-xs font-semibold text-[#032031] bg-white focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] cursor-pointer"
                        >
                          <option value="NIGHT_19_07">Night Watch (19:00 - 07:00 / 12 Hours)</option>
                          <option value="DAY_07_19">Day Shift (07:00 - 19:00 / 12 Hours)</option>
                          <option value="24_HOURS">24/7 Continuous Coverage (24 Hours)</option>
                          <option value="BUSINESS_08_18">Business Hours (08:00 - 18:00 / 10 Hours)</option>
                          <option value="EVENING_18_00">Evening Coverage (18:00 - 00:00 / 6 Hours)</option>
                          <option value="CUSTOM">Custom Shift Hours...</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Days Multi-Select Chips (shown if CUSTOM) */}
                    {scheduleDaysPreset === 'CUSTOM' && (
                      <div className="flex flex-col gap-1.5 p-3 bg-black/[0.02] border border-black/10 rounded-xl">
                        <span className="text-[10px] font-bold text-black/60 uppercase">Select Active Days:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                            const isDaySelected = customDays.includes(day);
                            return (
                              <button
                                type="button"
                                key={day}
                                onClick={() => {
                                  if (isDaySelected) {
                                    setCustomDays(customDays.filter((d) => d !== day));
                                  } else {
                                    setCustomDays([...customDays, day]);
                                  }
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  isDaySelected
                                    ? 'bg-[#032031] text-white shadow-xs'
                                    : 'bg-white border border-black/20 text-black hover:border-black'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Custom Shift Hours Pickers (shown if CUSTOM) */}
                    {scheduleHoursPreset === 'CUSTOM' && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-black/[0.02] border border-black/10 rounded-xl">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-black/60 uppercase">Start Time</label>
                          <input
                            type="time"
                            value={customStartTime}
                            onChange={(e) => setCustomStartTime(e.target.value)}
                            className="h-9 px-3 border border-black/25 rounded-lg text-xs font-bold text-[#032031] bg-white focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-black/60 uppercase">End Time</label>
                          <input
                            type="time"
                            value={customEndTime}
                            onChange={(e) => setCustomEndTime(e.target.value)}
                            className="h-9 px-3 border border-black/25 rounded-lg text-xs font-bold text-[#032031] bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Live Compiled Schedule Badge */}
                    <div className="p-3 bg-[#032031]/5 border border-[#032031]/15 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#032031] truncate">
                        <span className="text-[10px] font-black uppercase text-black/50 shrink-0">Selected Schedule:</span>
                        <span className="truncate">{formData.shiftScheduleNotes}</span>
                      </div>
                    </div>

                    {/* Additional Notes & Contract End Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#032031]">Additional Schedule Notes (Optional)</label>
                        <input
                          type="text"
                          value={extraScheduleNote}
                          onChange={(e) => setExtraScheduleNote(e.target.value)}
                          placeholder="e.g. Guard changeover at main gate, 30 min overlap..."
                          className="h-10 px-3.5 border border-black/25 rounded-lg text-xs font-semibold text-[#032031] bg-white placeholder:text-black/50 focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#032031]">
                          Contract End Date <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          name="serviceEndDate"
                          value={formData.serviceEndDate || ''}
                          onChange={handleInputChange}
                          className={`h-10 px-3.5 border rounded-lg text-xs font-semibold text-[#032031] bg-white focus:outline-none transition-all ${
                            formErrors.serviceEndDate
                              ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                              : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                          }`}
                        />
                        {formErrors.serviceEndDate ? (
                          <span className="text-xs text-red-600 font-bold">{formErrors.serviceEndDate}</span>
                        ) : (
                          <span className="text-[11px] text-black/50 font-medium">Expected completion date of deployment</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Section 3: Contact & Special Orders Card */}
                <div className="border border-black/15 rounded-xl p-5 bg-white flex flex-col gap-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#032031] font-black text-xs uppercase tracking-wider border-b border-black/10 pb-2.5">
                    <Phone className="w-4 h-4 text-[#032031]" />
                    <span>Emergency Contacts & Standing Instructions</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#032031]">
                        On-Site Emergency Contact <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. Marcus Evans (Facility Lead)"
                        className={`h-10 px-3.5 border rounded-lg text-xs font-semibold text-[#032031] bg-white placeholder:text-black/50 focus:outline-none transition-all ${
                          formErrors.emergencyContactName
                            ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                        }`}
                      />
                      {formErrors.emergencyContactName && (
                        <span className="text-xs text-red-600 font-bold">{formErrors.emergencyContactName}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#032031]">
                        Emergency Phone Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. +44 7911 123456"
                        className={`h-10 px-3.5 border rounded-lg text-xs font-semibold text-[#032031] bg-white placeholder:text-black/50 focus:outline-none transition-all ${
                          formErrors.emergencyContactPhone
                            ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                        }`}
                      />
                      {formErrors.emergencyContactPhone && (
                        <span className="text-xs text-red-600 font-bold">{formErrors.emergencyContactPhone}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-[#032031]">
                        Special Instructions & Known Hazards <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        name="specialInstructions"
                        value={formData.specialInstructions || ''}
                        onChange={handleInputChange}
                        placeholder="Provide details on gate access codes, alarm keypads, restricted areas, or specific patrol instructions..."
                        className={`p-3 border rounded-lg text-xs font-semibold text-[#032031] bg-white placeholder:text-black/50 focus:outline-none resize-none transition-all ${
                          formErrors.specialInstructions
                            ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-black/25 focus:border-[#032031] focus:ring-1 focus:ring-[#032031]'
                        }`}
                      />
                      {formErrors.specialInstructions && (
                        <span className="text-xs text-red-600 font-bold">{formErrors.specialInstructions}</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Bar Footer */}
              <div className="px-6 sm:px-8 py-4 border-t border-black/10 flex items-center justify-end gap-3 bg-zinc-50/80 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-xs font-bold text-black border border-black/25 hover:border-black hover:bg-black/5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#032031] hover:bg-black text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <LoaderRectangle />
                      <span>{editingRequest ? 'Saving Changes...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      {editingRequest ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{editingRequest ? 'Save Changes' : 'Submit Request'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. REDESIGNED COMPREHENSIVE REQUEST DETAILS MODAL (max-w-4xl, Fully Responsive) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-black/10 flex items-center justify-between bg-zinc-50 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#032031] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
                      Deployment Request Details
                    </span>
                    {getUrgencyBadge(selectedRequest.urgency)}
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-black/5 text-[#032031] border border-black/10">
                      {selectedRequest.type === 'NEW_SITE_DEPLOYMENT' && 'New Site Deployment'}
                      {selectedRequest.type === 'EXTRA_GUARD_COVERAGE' && 'Extra Officer Manning'}
                      {selectedRequest.type === 'SCHEDULE_CHANGE' && 'Schedule Modification'}
                      {selectedRequest.type === 'SPECIAL_EVENT' && 'Special Event Security'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-[#032031] tracking-tight">
                    {selectedRequest.propertyName}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="w-9 h-9 rounded-xl border border-black/15 text-black/60 hover:text-black hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body: Responsive 2-Column Grid */}
            <div className="flex-grow overflow-y-auto px-6 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-neutral-800">
              
              {/* Left Column (6 cols on lg) */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                
                {/* Status & Lifecycle Card */}
                <div className="p-4 rounded-xl border border-black/15 bg-black/[0.02] flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Request Status</span>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-black/40 uppercase">Request ID</span>
                      <span className="font-mono font-bold text-[#032031] truncate" title={selectedRequest.id}>
                        {selectedRequest.id.slice(0, 13)}...
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-black/40 uppercase">Date Submitted</span>
                      <span className="font-bold text-black">
                        {new Date(selectedRequest.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property & Physical Location Card */}
                <div className="border border-black/15 rounded-xl p-5 bg-white flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#032031] font-black text-xs uppercase tracking-wider border-b border-black/10 pb-2">
                    <MapPin className="w-4 h-4 text-[#032031]" />
                    <span>Property & Location Details</span>
                  </div>

                  <div className="flex flex-col gap-1.5 font-semibold">
                    <span className="text-sm font-black text-[#032031]">{selectedRequest.propertyName}</span>
                    <span className="text-black/80 leading-snug">{selectedRequest.propertyAddress}</span>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-black/60 text-[11px]">
                      {selectedRequest.city && (
                        <span className="px-2 py-0.5 rounded bg-black/5 border border-black/10">
                          City: <strong>{selectedRequest.city}</strong>
                        </span>
                      )}
                      {selectedRequest.postcode && (
                        <span className="px-2 py-0.5 rounded bg-black/5 border border-black/10">
                          Postcode: <strong>{selectedRequest.postcode}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* On-Site Emergency Contacts Card */}
                <div className="border border-black/15 rounded-xl p-5 bg-white flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#032031] font-black text-xs uppercase tracking-wider border-b border-black/10 pb-2">
                    <Phone className="w-4 h-4 text-[#032031]" />
                    <span>On-Site Emergency Contacts</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-black/40 uppercase">Contact Name</span>
                      <span className="font-bold text-black text-xs">
                        {selectedRequest.emergencyContactName || 'Not specified'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-black/40 uppercase">Emergency Phone</span>
                      {selectedRequest.emergencyContactPhone ? (
                        <a 
                          href={`tel:${selectedRequest.emergencyContactPhone}`}
                          className="font-bold text-blue-700 hover:underline text-xs flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {selectedRequest.emergencyContactPhone}
                        </a>
                      ) : (
                        <span className="font-bold text-black text-xs">Not specified</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (6 cols on lg) */}
              <div className="lg:col-span-6 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-black/15 lg:pl-6 pt-5 lg:pt-0">
                
                {/* Security Operations / Control Room Review Card */}
                {(selectedRequest.adminFeedbackNotes || selectedRequest.status === 'APPROVED') && (
                  <div className="border border-black/15 rounded-xl p-4 bg-zinc-50 flex flex-col gap-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#032031] flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#032031]" />
                        Operations Control Room Review
                      </span>
                      {selectedRequest.reviewedAt && (
                        <span className="text-[10px] text-black/50 font-semibold">
                          Reviewed: {new Date(selectedRequest.reviewedAt).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>

                    {selectedRequest.adminFeedbackNotes && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex flex-col gap-1 text-amber-950">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800">Feedback & Instructions</span>
                        <p className="text-xs font-semibold leading-relaxed">{selectedRequest.adminFeedbackNotes}</p>
                      </div>
                    )}

                    {/* Official Site Link if Approved */}
                    {selectedRequest.status === 'APPROVED' && selectedRequest.site && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800">Official Geofenced Site</span>
                          <span className="text-xs font-black text-emerald-950">{selectedRequest.site.name}</span>
                          <span className="text-[10px] text-emerald-800 font-semibold">
                            Radius: {selectedRequest.site.geofenceRadiusMeters || 100}m Geofence Active
                          </span>
                        </div>
                        {onNavigateToSites && (
                          <button
                            onClick={() => {
                              setSelectedRequest(null);
                              onNavigateToSites();
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition shrink-0 cursor-pointer shadow-xs"
                          >
                            View in Secure Sites
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Guard Manning & Schedule Details Card */}
                <div className="border border-black/15 rounded-xl p-5 bg-white flex flex-col gap-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#032031] font-black text-xs uppercase tracking-wider border-b border-black/10 pb-2">
                    <Users className="w-4 h-4 text-[#032031]" />
                    <span>Guarding Manning & Schedule</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-black/[0.02] border border-black/10 flex flex-col">
                      <span className="text-[9px] font-bold text-black/40 uppercase">Required Officers</span>
                      <span className="text-sm font-black text-[#032031]">
                        {selectedRequest.requiredGuardsCount} {selectedRequest.requiredGuardsCount === 1 ? 'SIA Officer' : 'SIA Officers'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-black/[0.02] border border-black/10 flex flex-col">
                      <span className="text-[9px] font-bold text-black/40 uppercase">Service Start Date</span>
                      <span className="text-sm font-black text-[#032031]">
                        {new Date(selectedRequest.serviceStartDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-black/40 uppercase">Contract Duration</span>
                    <span className="font-semibold text-black">
                      {selectedRequest.serviceEndDate
                        ? `Fixed term until ${new Date(selectedRequest.serviceEndDate).toLocaleDateString('en-GB')}`
                        : 'Ongoing continuous security deployment'
                      }
                    </span>
                  </div>

                  {selectedRequest.shiftScheduleNotes && (
                    <div className="p-3 rounded-lg bg-[#032031]/5 border border-[#032031]/15 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#032031]">Operating Schedule</span>
                      <p className="font-bold text-xs text-[#032031] leading-relaxed">
                        {selectedRequest.shiftScheduleNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Special Instructions & Hazards Card */}
                {selectedRequest.specialInstructions && (
                  <div className="border border-black/15 rounded-xl p-5 bg-white flex flex-col gap-2.5 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#032031] border-b border-black/10 pb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#032031]" />
                      Site Standing Orders & Known Hazards
                    </span>
                    <p className="font-medium text-black/80 whitespace-pre-line leading-relaxed text-xs">
                      {selectedRequest.specialInstructions}
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-black/10 flex items-center justify-between gap-3 bg-zinc-50 shrink-0">
              {selectedRequest.status === 'PENDING_REVIEW' ? (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      const reqToEdit = selectedRequest;
                      setSelectedRequest(null);
                      handleOpenEditModal(reqToEdit);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-black hover:bg-black/5 text-[#032031] rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#032031]" />
                    Edit Request
                  </button>
                  <button
                    onClick={() => handleOpenCancelModal(selectedRequest)}
                    disabled={cancellingId === selectedRequest.id}
                    className="px-4 py-2 text-red-600 border border-red-300 hover:bg-red-50 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Cancel Request
                  </button>
                </div>
              ) : <div />}

              <button
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2.5 bg-[#032031] hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. DEDICATED CANCELLATION CONFIRMATION MODAL */}
      {isCancelModalOpen && requestToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between bg-zinc-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-black text-[#032031]">
                    Cancel Deployment Request
                  </h3>
                  <span className="text-[10px] font-bold text-black/50 uppercase">
                    Irreversible Action
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setRequestToCancel(null);
                }}
                className="w-8 h-8 rounded-xl border border-black/15 text-black/60 hover:text-black hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col gap-4 text-xs text-neutral-800">
              <p className="font-semibold text-black/80 leading-relaxed">
                Are you sure you want to cancel this pending security deployment request?
              </p>

              {/* Property summary capsule */}
              <div className="p-3.5 rounded-xl border border-black/15 bg-black/[0.02] flex flex-col gap-1.5 font-semibold">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#032031] shrink-0" />
                  <span className="font-black text-sm text-[#032031] truncate">
                    {requestToCancel.propertyName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-black/60 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-black/40 shrink-0" />
                  <span className="truncate">{requestToCancel.propertyAddress}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-black/60 border-t border-black/10">
                  <span>Officers: <strong>{requestToCancel.requiredGuardsCount} SIA Guards</strong></span>
                  <span>Start: <strong>{new Date(requestToCancel.serviceStartDate).toLocaleDateString('en-GB')}</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-black/60 font-medium leading-relaxed">
                Once cancelled, this request will be immediately removed from the operational deployment pipeline and no officers will be dispatched.
              </p>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 border-t border-black/10 flex items-center justify-end gap-3 bg-zinc-50 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setRequestToCancel(null);
                }}
                disabled={cancellingId === requestToCancel.id}
                className="px-4 py-2 border border-black/25 hover:border-black hover:bg-black/5 text-black font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancellingId === requestToCancel.id}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {cancellingId === requestToCancel.id ? (
                  <>
                    <LoaderRectangle />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SiteRequests;
