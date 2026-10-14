'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  adminService, 
  AdminSiteServiceRequest, 
  AdminVisitAssignee,
  RecordSurveyNotesPayload,
  ServiceRequestStatus, 
  ServiceRequestUrgency,
  ApproveSiteRequestPayload
} from '@/services/admin.service';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore, hasPermission } from '@/store/useAuthStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { LocationPickerMap } from '@/components/maps';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Search, 
  MapPin, 
  Users, 
  Calendar, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Eye, 
  XCircle, 
  Phone, 
  Shield, 
  Layers, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  ArrowRight,
  Filter,
  FileText,
  AlertCircle,
  Printer,
  Download,
  RotateCw,
  RotateCcw,
  Locate,
  ClipboardCheck
} from 'lucide-react';

export const SiteRequestsManagement: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);
  const currentUser = useAuthStore((state) => state.user);
  const canAssess = hasPermission(currentUser, 'requests:assess');
  const canApprove = hasPermission(currentUser, 'requests:approve');

  // Data & loading states
  const [requests, setRequests] = useState<AdminSiteServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Selected Request for Deployment Modal
  const [selectedRequest, setSelectedRequest] = useState<AdminSiteServiceRequest | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Provisioning Form
  const [provisionForm, setProvisionForm] = useState<ApproveSiteRequestPayload>({
    latitude: 51.5074,
    longitude: -0.1278,
    geofenceRadiusMeters: 100,
    siteInstructions: '',
    emergencyContact: '',
    adminFeedbackNotes: '',
  });

  // Decline Dialog
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Assessment Notes
  const [assessmentNotes, setAssessmentNotes] = useState('');

  // Physical Site Visit Modal State
  const [assignees, setAssignees] = useState<AdminVisitAssignee[]>([]);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitForm, setVisitForm] = useState({
    visitAssigneeId: '',
    visitScheduledAt: '',
    adminFeedbackNotes: '',
  });

  // Interim Site Survey Modal State
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [surveyForm, setSurveyForm] = useState<{
    surveyLatitude: string | number;
    surveyLongitude: string | number;
    surveyGeofenceRadiusMeters: number;
    surveyContactName: string;
    surveyContactPhone: string;
    surveyNotes: string;
    surveyConductedAt: string;
  }>({
    surveyLatitude: '',
    surveyLongitude: '',
    surveyGeofenceRadiusMeters: 100,
    surveyContactName: '',
    surveyContactPhone: '',
    surveyNotes: '',
    surveyConductedAt: '',
  });

  // Row Selection State for Targeted Export / Print
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllVisibleSelected = requests.length > 0 && requests.every((r) => selectedIds.includes(r.id));
  const isSomeVisibleSelected = requests.some((r) => selectedIds.includes(r.id)) && !isAllVisibleSelected;

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleIds = requests.map((r) => r.id);
      setSelectedIds(selectedIds.filter((id) => !visibleIds.includes(id)));
    } else {
      const newSelected = Array.from(new Set([...selectedIds, ...requests.map((r) => r.id)]));
      setSelectedIds(newSelected);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getSiteServiceRequests({
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
      addToast(err.message || 'Failed to retrieve site service requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, urgencyFilter, searchQuery, page, limit, selectedRequest, addToast]);

  useEffect(() => {
    loadRequests();
  }, [activeTab, urgencyFilter, page, limit]);

  // Debounced search trigger
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
      addToast('Site service requests refreshed with latest updates', 'success');
    } catch {
      // loadRequests already handles toast on error
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenDeployModal = (req: AdminSiteServiceRequest) => {
    setSelectedRequest(req);

    // Pre-fill with surveyed GPS and survey findings if available, otherwise suggested/fallback
    const effectiveLat = req.surveyLatitude !== undefined && req.surveyLatitude !== null
      ? Number(req.surveyLatitude)
      : req.suggestedLatitude !== undefined && req.suggestedLatitude !== null
      ? Number(req.suggestedLatitude)
      : 51.5074;
    const effectiveLng = req.surveyLongitude !== undefined && req.surveyLongitude !== null
      ? Number(req.surveyLongitude)
      : req.suggestedLongitude !== undefined && req.suggestedLongitude !== null
      ? Number(req.suggestedLongitude)
      : -0.1278;
    const effectiveRadius = req.surveyGeofenceRadiusMeters || 100;
    const effectiveInstructions = req.surveyNotes || req.specialInstructions || '';
    const effectiveContact = req.surveyContactName 
      ? `${req.surveyContactName} (${req.surveyContactPhone || ''})`.trim()
      : req.emergencyContactName ? `${req.emergencyContactName} (${req.emergencyContactPhone || ''})`.trim() : '';

    setProvisionForm({
      latitude: effectiveLat,
      longitude: effectiveLng,
      geofenceRadiusMeters: effectiveRadius,
      siteInstructions: effectiveInstructions,
      emergencyContact: effectiveContact,
      adminFeedbackNotes: 'Deployment request approved. Site provisioned for security operations scheduling.',
    });
    setAssessmentNotes(req.adminFeedbackNotes || '');
    setIsDeployModalOpen(true);
  };

  const handleOpenSurveyModal = (req: AdminSiteServiceRequest) => {
    setSelectedRequest(req);
    const now = new Date();
    setSurveyForm({
      surveyLatitude: req.surveyLatitude !== undefined && req.surveyLatitude !== null
        ? String(req.surveyLatitude)
        : req.suggestedLatitude !== undefined && req.suggestedLatitude !== null
        ? String(req.suggestedLatitude)
        : '',
      surveyLongitude: req.surveyLongitude !== undefined && req.surveyLongitude !== null
        ? String(req.surveyLongitude)
        : req.suggestedLongitude !== undefined && req.suggestedLongitude !== null
        ? String(req.suggestedLongitude)
        : '',
      surveyGeofenceRadiusMeters: req.surveyGeofenceRadiusMeters || 100,
      surveyContactName: req.surveyContactName || req.emergencyContactName || '',
      surveyContactPhone: req.surveyContactPhone || req.emergencyContactPhone || '',
      surveyNotes: req.surveyNotes || '',
      surveyConductedAt: req.surveyConductedAt
        ? new Date(req.surveyConductedAt).toISOString().slice(0, 16)
        : now.toISOString().slice(0, 16),
    });
    setIsSurveyModalOpen(true);
  };

  const handleGetBrowserLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setSurveyForm((prev) => ({
          ...prev,
          surveyLatitude: lat,
          surveyLongitude: lng,
        }));
        addToast(`GPS captured: ${lat}, ${lng} (accuracy: ±${Math.round(pos.coords.accuracy)}m)`, 'success');
      },
      (err) => {
        setLocatingGps(false);
        addToast(`Could not acquire device GPS: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await adminService.recordSiteSurveyNotes(selectedRequest.id, {
        surveyLatitude: surveyForm.surveyLatitude ? Number(surveyForm.surveyLatitude) : null,
        surveyLongitude: surveyForm.surveyLongitude ? Number(surveyForm.surveyLongitude) : null,
        surveyGeofenceRadiusMeters: surveyForm.surveyGeofenceRadiusMeters ? Number(surveyForm.surveyGeofenceRadiusMeters) : 100,
        surveyContactName: surveyForm.surveyContactName?.trim() || null,
        surveyContactPhone: surveyForm.surveyContactPhone?.trim() || null,
        surveyNotes: surveyForm.surveyNotes?.trim() || null,
        surveyConductedAt: surveyForm.surveyConductedAt ? new Date(surveyForm.surveyConductedAt).toISOString() : new Date().toISOString(),
      });

      addToast('On-site survey findings and coordinates recorded successfully!', 'success');
      setIsSurveyModalOpen(false);
      await loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Failed to record site survey findings', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAndDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await adminService.approveSiteServiceRequest(selectedRequest.id, {
        latitude: provisionForm.latitude,
        longitude: provisionForm.longitude,
        geofenceRadiusMeters: provisionForm.geofenceRadiusMeters,
        siteInstructions: provisionForm.siteInstructions || null,
        emergencyContact: provisionForm.emergencyContact || null,
        adminFeedbackNotes: provisionForm.adminFeedbackNotes || null,
      });

      addToast(`Site "${selectedRequest.propertyName}" successfully approved and deployed!`, 'success');
      setIsDeployModalOpen(false);
      await loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Failed to approve and deploy site', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssessRequest = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await adminService.assessSiteServiceRequest(selectedRequest.id, assessmentNotes);
      addToast('Request moved to Under Assessment status', 'success');
      setIsDeployModalOpen(false);
      await loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Failed to update request assessment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!rejectionNotes.trim()) {
      addToast('Please provide an operational rejection reason', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.rejectSiteServiceRequest(selectedRequest.id, rejectionNotes);
      addToast('Site service request declined', 'success');
      setIsRejectModalOpen(false);
      setIsDeployModalOpen(false);
      setRejectionNotes('');
      await loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Failed to reject request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevertRequest = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await adminService.revertSiteServiceRequest(selectedRequest.id, assessmentNotes);
      addToast('Request moved to Pending Review status', 'success');
      setIsDeployModalOpen(false);
      await loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Failed to revert request to pending', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const loadAssignees = async () => {
    try {
      const res = await adminService.getVisitAssignees();
      setAssignees(res.assignees || []);
      if (res.assignees && res.assignees.length > 0) {
        setVisitForm((prev) => {
          if (prev.visitAssigneeId) return prev;
          const matchCurrent = res.assignees.find((a) => a.id === currentUser?.id);
          return {
            ...prev,
            visitAssigneeId: matchCurrent ? matchCurrent.id : res.assignees[0].id,
          };
        });
      }
    } catch (err) {
      console.error('Failed to load visit assignees', err);
    }
  };

  const handleOpenVisitModal = (req: AdminSiteServiceRequest) => {
    setSelectedRequest(req);

    // Default visit schedule: tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const defaultDateStr = tomorrow.toISOString().slice(0, 16);

    setVisitForm({
      visitAssigneeId: req.visitAssigneeId || currentUser?.id || '',
      visitScheduledAt: req.visitScheduledAt ? new Date(req.visitScheduledAt).toISOString().slice(0, 16) : defaultDateStr,
      adminFeedbackNotes: req.adminFeedbackNotes || '',
    });

    setIsVisitModalOpen(true);
    loadAssignees();
  };

  const handleScheduleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!visitForm.visitAssigneeId) {
      addToast('Please select an officer or administrator to assign', 'error');
      return;
    }
    if (!visitForm.visitScheduledAt) {
      addToast('Please select a visit date and time', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.scheduleSiteVisit(selectedRequest.id, {
        visitAssigneeId: visitForm.visitAssigneeId,
        visitScheduledAt: new Date(visitForm.visitScheduledAt).toISOString(),
        adminFeedbackNotes: visitForm.adminFeedbackNotes || null,
      });

      addToast('Physical site visit scheduled and request moved to Under Assessment', 'success');
      setIsVisitModalOpen(false);
      setIsDeployModalOpen(false);
      await loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Failed to schedule site visit', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const handleExportCSV = async () => {
    try {
      const isTargeted = selectedIds.length > 0;
      addToast(
        isTargeted
          ? `Preparing CSV export for ${selectedIds.length} selected requests...`
          : 'Preparing full CSV export...',
        'info'
      );

      const res = await adminService.getSiteServiceRequests({
        status: isTargeted ? undefined : (activeTab === 'ALL' ? undefined : activeTab),
        urgency: isTargeted ? undefined : (urgencyFilter === 'ALL' ? undefined : urgencyFilter),
        search: isTargeted ? undefined : (searchQuery.trim() || undefined),
        export: true,
      });

      let list = res.requests || [];
      if (isTargeted) {
        list = list.filter((r) => selectedIds.includes(r.id));
      }

      if (list.length === 0) {
        addToast('No requests found to export', 'info');
        return;
      }

      const headers = [
        'Request ID',
        'Status',
        'Urgency',
        'Coverage Type',
        'Client Organization',
        'Client Email',
        'Property Name',
        'Property Address',
        'City',
        'Postcode',
        'Officers Count',
        'Service Start Date',
        'Service End Date',
        'Operating Schedule',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Special Instructions / Hazards',
        'Admin Feedback Notes',
        'Submitted At',
        'Reviewed At',
        'Provisioned Site ID',
      ];

      const rows = list.map((r) => [
        escapeCsv(r.id),
        escapeCsv(r.status),
        escapeCsv(r.urgency),
        escapeCsv(r.type),
        escapeCsv(r.client?.companyName || 'Corporate Client'),
        escapeCsv(r.client?.user?.email || ''),
        escapeCsv(r.propertyName),
        escapeCsv(r.propertyAddress),
        escapeCsv(r.city || ''),
        escapeCsv(r.postcode || ''),
        escapeCsv(r.requiredGuardsCount),
        escapeCsv(new Date(r.serviceStartDate).toLocaleDateString('en-GB')),
        escapeCsv(r.serviceEndDate ? new Date(r.serviceEndDate).toLocaleDateString('en-GB') : 'Ongoing'),
        escapeCsv(r.shiftScheduleNotes || ''),
        escapeCsv(r.emergencyContactName || ''),
        escapeCsv(r.emergencyContactPhone || ''),
        escapeCsv(r.specialInstructions || ''),
        escapeCsv(r.adminFeedbackNotes || ''),
        escapeCsv(new Date(r.createdAt).toLocaleString('en-GB')),
        escapeCsv(r.reviewedAt ? new Date(r.reviewedAt).toLocaleString('en-GB') : 'N/A'),
        escapeCsv(r.siteId || 'N/A'),
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = isTargeted
        ? `selected-site-requests-${list.length}-${new Date().toISOString().slice(0, 10)}.csv`
        : `site-service-requests-${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(`Successfully downloaded ${list.length} requests as CSV!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to export CSV', 'error');
    }
  };

  const handlePrintReport = async () => {
    try {
      const isTargeted = selectedIds.length > 0;
      addToast(
        isTargeted
          ? `Preparing print view for ${selectedIds.length} selected requests...`
          : 'Preparing full print view...',
        'info'
      );

      const res = await adminService.getSiteServiceRequests({
        status: isTargeted ? undefined : (activeTab === 'ALL' ? undefined : activeTab),
        urgency: isTargeted ? undefined : (urgencyFilter === 'ALL' ? undefined : urgencyFilter),
        search: isTargeted ? undefined : (searchQuery.trim() || undefined),
        export: true,
      });

      let list = res.requests || [];
      if (isTargeted) {
        list = list.filter((r) => selectedIds.includes(r.id));
      }

      if (list.length === 0) {
        addToast('No requests available to print', 'info');
        return;
      }

      const printWindow = window.open('', '_blank', 'width=1100,height=800');
      if (!printWindow) {
        addToast('Please allow browser popups to view the printable report', 'error');
        return;
      }

      const rowsHtml = list.map((r, i) => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${i + 1}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; font-weight: bold;">
            ${r.client?.companyName || 'Corporate Client'}<br/>
            <span style="font-weight: normal; color: #6b7280; font-size: 10px;">${r.client?.user?.email || ''}</span>
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">
            <strong>${r.propertyName}</strong><br/>
            <span style="color: #4b5563; font-size: 10px;">${r.propertyAddress}${r.city ? `, ${r.city}` : ''}${r.postcode ? ` ${r.postcode}` : ''}</span>
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-align: center; font-weight: bold;">
            ${r.requiredGuardsCount} SIA
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">
            ${new Date(r.serviceStartDate).toLocaleDateString('en-GB')}<br/>
            <span style="color: #6b7280; font-size: 10px;">${r.shiftScheduleNotes || 'Standard'}</span>
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 10px; text-align: center;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: #f3f4f6; border: 1px solid #d1d5db;">
              ${r.status.replace(/_/g, ' ')}
            </span>
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 10px;">
            ${r.emergencyContactName ? `${r.emergencyContactName} (${r.emergencyContactPhone || ''})` : 'N/A'}
          </td>
        </tr>
      `).join('');

      const reportHtml = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '<title>Fortress ASR - Site Service Requests Report</title>',
        '<style>',
        '@page { size: landscape; margin: 15mm; }',
        'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 20px; }',
        '.header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #032031; padding-bottom: 14px; margin-bottom: 18px; }',
        '.title { font-size: 20px; font-weight: 900; color: #032031; text-transform: uppercase; margin: 0; letter-spacing: -0.5px; }',
        '.subtitle { font-size: 11px; color: #6b7280; font-weight: 600; margin-top: 4px; }',
        '.meta { text-align: right; font-size: 11px; color: #4b5563; font-weight: 600; }',
        'table { width: 100%; border-collapse: collapse; text-align: left; }',
        'th { background: #f9fafb; padding: 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #374151; border-bottom: 2px solid #d1d5db; letter-spacing: 0.5px; }',
        '.footer { margin-top: 25px; padding-top: 10px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; font-weight: bold; }',
        '</style>',
        '</head>',
        '<body>',
        '<div class="header">',
        '<div>',
        '<h1 class="title">Fortress ASR Security Operations</h1>',
        '<div class="subtitle">Client Site Service Requests & Deployment Schedule Report</div>',
        '</div>',
        '<div class="meta">',
        `<div>Generated: ${new Date().toLocaleString('en-GB')}</div>`,
        `<div>Filter: ${activeTab} | Records: ${list.length}</div>`,
        '</div>',
        '</div>',
        '<table>',
        '<thead>',
        '<tr>',
        '<th style="width: 30px;">#</th>',
        '<th style="width: 170px;">Client Organization</th>',
        '<th>Property / Location</th>',
        '<th style="width: 80px; text-align: center;">Manning</th>',
        '<th style="width: 170px;">Start Date & Schedule</th>',
        '<th style="width: 110px; text-align: center;">Status</th>',
        '<th style="width: 150px;">Emergency Contact</th>',
        '</tr>',
        '</thead>',
        '<tbody>',
        rowsHtml,
        '</tbody>',
        '</table>',
        '<div class="footer">',
        '<span>Security Operations Management System (SOMS)</span>',
        '<span>Confidential Operational Record</span>',
        '</div>',
        '<script>',
        'window.onload = function() { window.print(); };',
        '</script>',
        '</body>',
        '</html>',
      ].join('\n');

      printWindow.document.write(reportHtml);
      printWindow.document.close();
    } catch (err: any) {
      addToast(err.message || 'Failed to generate print report', 'error');
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
            Cancelled by Client
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
      
      {/* 1. Report & Operational Action Controls (Fully Responsive across all viewports) */}
      <div className="w-full flex items-center justify-end">
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 border border-black hover:bg-black/5 text-[#032031] text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            title="Refresh requests with latest operational data"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#032031] shrink-0 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 border border-black text-[#032031] text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition hover:bg-black/5 cursor-pointer shadow-2xs active:scale-[0.98]"
            title={selectedIds.length > 0 ? `Print ${selectedIds.length} selected requests` : "Print formatted report"}
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#032031] shrink-0" />
            <span className="hidden sm:inline">
              {selectedIds.length > 0 ? `Print (${selectedIds.length})` : 'Print Report'}
            </span>
            <span className="sm:hidden">
              {selectedIds.length > 0 ? `Print (${selectedIds.length})` : 'Print'}
            </span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-[#032031] hover:bg-black text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs hover:shadow cursor-pointer active:scale-[0.98]"
            title={selectedIds.length > 0 ? `Export ${selectedIds.length} selected requests to CSV` : "Download CSV of matching requests"}
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">
              {selectedIds.length > 0 ? `Export (${selectedIds.length})` : 'Download CSV'}
            </span>
            <span className="sm:hidden">
              {selectedIds.length > 0 ? `CSV (${selectedIds.length})` : 'Export'}
            </span>
          </button>

        </div>
      </div>

      {/* 2. Redesigned 4 KPI Cards: Total Request, Pending Review, Under Assessment, Approved & Deployed */}
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
              { id: 'UNDER_ASSESSMENT', label: 'Under Assessment' },
              { id: 'APPROVED', label: 'Approved Sites' },
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
                placeholder="Search property, address, client..."
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

        {/* Selected Requests Action Bar */}
        {selectedIds.length > 0 && (
          <div className="px-4 py-2.5 bg-[#032031] text-white border-b border-black/10 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                {selectedIds.length} {selectedIds.length === 1 ? 'Request' : 'Requests'} Selected
              </span>
              <span className="text-white/40">|</span>
              <button
                onClick={handleClearSelection}
                className="text-[11px] font-bold text-white/80 hover:text-white underline cursor-pointer"
              >
                Clear selection
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintReport}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Selected ({selectedIds.length})</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Requests Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <LoaderRectangle />
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Loading deployment requests...
            </span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4 gap-3">
            <Inbox className="w-10 h-10 text-black/20" />
            <h3 className="text-sm font-black text-black uppercase tracking-wider">No requests found</h3>
            <p className="text-xs text-black/60 max-w-md font-medium">
              {searchQuery
                ? 'No client requests matched your search query.'
                : 'All deployment requests under this category have been processed.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02] text-[9px] font-black uppercase tracking-wider text-black/60">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeVisibleSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-black/30 text-[#032031] focus:ring-1 focus:ring-[#032031] cursor-pointer"
                      title="Select/Deselect all visible requests on this page"
                    />
                  </th>
                  <th className="py-3 px-4">Client Organization</th>
                  <th className="py-3 px-4">Property & Location</th>
                  <th className="py-3 px-4">Guards</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {requests.map((req) => (
                  <tr 
                    key={req.id} 
                    onClick={() => handleOpenDeployModal(req)}
                    className={`transition cursor-pointer ${
                      selectedIds.includes(req.id) 
                        ? 'bg-blue-50/60 hover:bg-blue-50/80' 
                        : 'hover:bg-black/[0.025]'
                    }`}
                  >
                    
                    {/* Checkbox */}
                    <td 
                      className="py-3.5 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(req.id)}
                        onChange={() => handleToggleSelectRow(req.id)}
                        className="w-4 h-4 rounded border-black/30 text-[#032031] focus:ring-1 focus:ring-[#032031] cursor-pointer"
                      />
                    </td>

                    {/* Client Organization */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black/5 border border-black/10 flex items-center justify-center text-[11px] font-black overflow-hidden relative shrink-0">
                          {req.client?.logoUrl ? (
                            <img src={getFullImageUrl(req.client.logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            req.client?.companyName?.[0] || 'C'
                          )}
                        </div>
                        <div className="flex flex-col truncate max-w-[170px]">
                          <span className="font-bold text-[#032031] text-xs truncate">
                            {req.client?.companyName || 'Corporate Client'}
                          </span>
                          <span className="text-[10px] text-black/50 truncate">
                            {req.client?.user?.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Property & Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#032031] text-xs">{req.propertyName}</span>
                          {getUrgencyBadge(req.urgency)}
                        </div>
                        <div className="flex items-center gap-1.5 text-black/60 text-[11px]">
                          <MapPin className="w-3 h-3 text-black/40 shrink-0" />
                          <span className="truncate">{req.propertyAddress}</span>
                        </div>
                      </div>
                    </td>

                    {/* Manning Required */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-black text-xs">
                        <Users className="w-3.5 h-3.5 text-black/50" />
                        {req.requiredGuardsCount} {req.requiredGuardsCount === 1 ? 'Officer' : 'Officers'}
                      </span>
                    </td>

                    {/* Target Start */}
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

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(req.status)}
                        {req.visitScheduledAt && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>
                              Visit: {new Date(req.visitScheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              {req.visitAssignee ? ` (${req.visitAssignee.firstName} ${req.visitAssignee.lastName?.charAt(0)}.)` : ''}
                            </span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeployModal(req);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#032031] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
                      >
                        <span>{canApprove ? 'Review & Deploy' : 'View Details'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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

      {/* 5. REDESIGNED ADMIN DEPLOYMENT REVIEW & SURVEY ASSESSMENT MODAL (Fully Responsive) */}
      {isDeployModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header: Premium Fortress ASR Deep Navy Theme */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-[#032031] text-white shrink-0">
              <div className="flex items-center gap-3 truncate">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/15 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300">
                      Deployment Review & Physical Assessment
                    </span>
                    {getUrgencyBadge(selectedRequest.urgency)}
                  </div>
                  <h2 className="text-sm sm:text-base md:text-lg font-black text-white truncate">
                    {selectedRequest.propertyName}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                title="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body: Responsive 2-Column Grid */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs text-slate-800 bg-white">
              
              {/* Left Column: Client Requirements & Survey Brief (6 cols on lg) */}
              <div className="lg:col-span-6 flex flex-col gap-3.5">
                
                {/* Client Profile Capsule */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3 shadow-2xs">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black overflow-hidden relative shrink-0 text-[#032031] shadow-2xs">
                    {selectedRequest.client?.logoUrl ? (
                      <img src={getFullImageUrl(selectedRequest.client.logoUrl)} alt="Client" className="w-full h-full object-cover" />
                    ) : (
                      selectedRequest.client?.companyName?.[0] || 'C'
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Requesting Organization</span>
                    <h3 className="font-black text-[#032031] text-xs sm:text-sm truncate">{selectedRequest.client?.companyName}</h3>
                    <span className="text-[11px] text-slate-600 truncate font-semibold">{selectedRequest.client?.user?.email}</span>
                  </div>
                </div>

                {/* Physical Visit Assessment Card (if scheduled) */}
                {selectedRequest.visitScheduledAt && (
                  <div className="p-3.5 sm:p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-indigo-200/70 pb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                        Physical Site Visit Scheduled
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        selectedRequest.visitStatus === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {selectedRequest.visitStatus || 'PENDING'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-indigo-800/70 font-bold">Assigned Officer</span>
                        <span className="text-indigo-950 font-black">
                          {selectedRequest.visitAssignee ? `${selectedRequest.visitAssignee.firstName} ${selectedRequest.visitAssignee.lastName}` : 'Unassigned'}
                        </span>
                        <span className="text-[10px] text-indigo-800/80 truncate">{selectedRequest.visitAssignee?.email}</span>
                      </div>
                      <div className="flex flex-col sm:text-right">
                        <span className="text-[9px] uppercase text-indigo-800/70 font-bold">Visit Schedule</span>
                        <span className="text-indigo-950 font-black">
                          {new Date(selectedRequest.visitScheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-indigo-800/80">
                          {new Date(selectedRequest.visitScheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* On-Site Physical Survey Report & Verified GPS Card */}
                {(selectedRequest.surveyNotes || selectedRequest.surveyLatitude || selectedRequest.surveyConductedAt) && (
                  <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                        <ClipboardCheck className="w-3.5 h-3.5 text-emerald-700" />
                        On-Site Survey Findings & GPS Verified
                      </span>
                      {selectedRequest.surveyConductedAt && (
                        <span className="text-[9px] font-bold text-emerald-800">
                          Surveyed: {new Date(selectedRequest.surveyConductedAt).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-emerald-800/80 uppercase">Verified GPS</span>
                        <span className="font-black text-emerald-950 font-mono text-xs">
                          {selectedRequest.surveyLatitude ? `${Number(selectedRequest.surveyLatitude).toFixed(6)}, ${Number(selectedRequest.surveyLongitude).toFixed(6)}` : 'Standard Coordinates'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-emerald-800/80 uppercase">Geofence Radius</span>
                        <span className="font-black text-emerald-950 text-xs">
                          {selectedRequest.surveyGeofenceRadiusMeters || 100} meters
                        </span>
                      </div>
                    </div>

                    {selectedRequest.surveyContactName && (
                      <div className="flex flex-col text-[11px] border-t border-emerald-200/60 pt-1.5">
                        <span className="text-[9px] font-bold text-emerald-800/80 uppercase">Site Contact Met On-Site</span>
                        <span className="font-bold text-emerald-950">
                          {selectedRequest.surveyContactName} {selectedRequest.surveyContactPhone ? `(${selectedRequest.surveyContactPhone})` : ''}
                        </span>
                      </div>
                    )}

                    {selectedRequest.surveyNotes && (
                      <div className="flex flex-col text-[11px] border-t border-emerald-200/60 pt-1.5">
                        <span className="text-[9px] font-bold text-emerald-800/80 uppercase">Survey Notes & Assessment</span>
                        <p className="text-[11px] font-medium text-emerald-900 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-emerald-200/60 whitespace-pre-line">
                          {selectedRequest.surveyNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Location Details Card */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#032031]" />
                    Deployment Location
                  </span>
                  <div className="flex flex-col gap-0.5 font-semibold text-slate-900">
                    <span className="font-black text-xs sm:text-sm text-[#032031]">{selectedRequest.propertyName}</span>
                    <span className="text-slate-700 leading-snug">{selectedRequest.propertyAddress}</span>
                    {(selectedRequest.city || selectedRequest.postcode) && (
                      <span className="text-slate-500 text-[11px] font-bold">{selectedRequest.city} {selectedRequest.postcode}</span>
                    )}
                  </div>
                </div>

                {/* Manning & Schedule Card */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#032031]" />
                    Guarding Schedule & Requirements
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Officers Needed</span>
                      <span className="font-black text-[#032031] text-xs sm:text-sm">{selectedRequest.requiredGuardsCount} SIA Officers</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Target Start Date</span>
                      <span className="font-black text-[#032031] text-xs sm:text-sm">
                        {new Date(selectedRequest.serviceStartDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>

                  {selectedRequest.shiftScheduleNotes && (
                    <div className="flex flex-col pt-1.5 border-t border-slate-100">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Operating Schedule</span>
                      <p className="font-bold text-xs text-[#032031] leading-relaxed">{selectedRequest.shiftScheduleNotes}</p>
                    </div>
                  )}

                  {selectedRequest.serviceEndDate && (
                    <div className="flex flex-col pt-1.5 border-t border-slate-100">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Contract End Date</span>
                      <p className="font-semibold text-slate-700">{new Date(selectedRequest.serviceEndDate).toLocaleDateString('en-GB')}</p>
                    </div>
                  )}
                </div>

                {/* Site Hazards / Special Instructions (if present) */}
                {selectedRequest.specialInstructions && (
                  <div className="p-3.5 sm:p-4 rounded-xl border border-amber-300 bg-amber-50/70 flex flex-col gap-1 text-amber-950 shadow-2xs">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Site Instructions & Known Hazards
                    </span>
                    <p className="font-semibold leading-relaxed whitespace-pre-line text-[11px]">
                      {selectedRequest.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Emergency Contact */}
                {(selectedRequest.emergencyContactName || selectedRequest.emergencyContactPhone) && (
                  <div className="p-3 rounded-xl border border-slate-200 flex items-center gap-2.5 bg-slate-50/80 shadow-2xs">
                    <Phone className="w-4 h-4 text-[#032031] shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Client Emergency Contact</span>
                      <span className="font-bold text-slate-900 truncate">
                        {selectedRequest.emergencyContactName} {selectedRequest.emergencyContactPhone && `(${selectedRequest.emergencyContactPhone})`}
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Operations Standing Orders & Deployment Configuration (6 cols on lg) */}
              <div className="lg:col-span-6 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-5 lg:pt-0">
                
                <form id="provision-form" onSubmit={handleApproveAndDeploy} className="flex flex-col gap-4">
                  
                  {/* Deployment Standing Orders Card */}
                  <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white flex flex-col gap-3.5 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#032031] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#032031]" />
                      Operations Deployment Orders
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-[#032031]">Duty Emergency Contact *</label>
                      <input
                        type="text"
                        value={provisionForm.emergencyContact || ''}
                        onChange={(e) => setProvisionForm({ ...provisionForm, emergencyContact: e.target.value })}
                        placeholder="e.g. Operations Control Room - 020 7946 0192"
                        className="h-10 px-3.5 border border-slate-300 rounded-xl font-medium text-xs bg-white focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] transition"
                      />
                      <span className="text-[10px] text-slate-500">
                        Primary 24/7 hotline given to assigned guards on site.
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-[#032031]">Site Standing Orders (Visible to Assigned Guards)</label>
                      <textarea
                        rows={3}
                        value={provisionForm.siteInstructions || ''}
                        onChange={(e) => setProvisionForm({ ...provisionForm, siteInstructions: e.target.value })}
                        placeholder="Key safe access codes, perimeter patrol intervals, alarm protocols, gate opening hours..."
                        className="p-3 border border-slate-300 rounded-xl font-medium text-xs bg-white resize-none focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-[#032031]">Approval Feedback Notes (Published to Client Portal)</label>
                      <textarea
                        rows={2}
                        value={provisionForm.adminFeedbackNotes || ''}
                        onChange={(e) => setProvisionForm({ ...provisionForm, adminFeedbackNotes: e.target.value })}
                        placeholder="Notes notifying client that security deployment is confirmed and officers are being rostered..."
                        className="p-3 border border-slate-300 rounded-xl font-medium text-xs bg-white resize-none focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] transition"
                      />
                    </div>
                  </div>

                  {/* Provisioning Info Notice */}
                  <div className="p-4 bg-[#032031]/5 border border-[#032031]/15 rounded-xl flex items-start gap-3 text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="font-black text-[#032031]">Automatic Site Geofencing</span>
                      <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                        Approving this request creates the official physical property in the database with standard 100m geofence validation. Specific coordinate adjustments can be modified anytime in <strong>Site Management</strong>.
                      </p>
                    </div>
                  </div>

                </form>

              </div>

            </div>

            {/* Modal Actions Footer: Fully Responsive & Accurately Aligned */}
            <div className="p-3.5 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              
              {/* Left Action Cluster: Operational Lifecycle (Wrap / Grid on Mobile, Flex on Desktop) */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                {canAssess && selectedRequest.status !== 'PENDING_REVIEW' && (
                  <button
                    type="button"
                    onClick={handleRevertRequest}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-600" />
                    <span>Revert</span>
                  </button>
                )}

                {canAssess && selectedRequest.status !== 'UNDER_ASSESSMENT' && (
                  <button
                    type="button"
                    onClick={handleAssessRequest}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <Shield className="w-3 h-3 text-blue-700" />
                    <span>Assessment</span>
                  </button>
                )}

                {canAssess && (
                  <button
                    type="button"
                    onClick={() => handleOpenVisitModal(selectedRequest)}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-indigo-800 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <Calendar className="w-3 h-3 text-indigo-700" />
                    <span>{selectedRequest.visitScheduledAt ? 'Reschedule' : 'Site Visit'}</span>
                  </button>
                )}

                {canAssess && (
                  <button
                    type="button"
                    onClick={() => handleOpenSurveyModal(selectedRequest)}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{selectedRequest.surveyNotes || selectedRequest.surveyConductedAt ? 'Update Survey' : 'Log Survey'}</span>
                  </button>
                )}

                {canApprove && selectedRequest.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Decline</span>
                  </button>
                )}
              </div>

              {/* Right Action Cluster: Submission & Cancellation (Full width on mobile, right aligned on desktop) */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDeployModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                >
                  Cancel
                </button>

                {canApprove ? (
                  <button
                    type="submit"
                    form="provision-form"
                    disabled={actionLoading}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-[#032031] hover:bg-black text-white font-black uppercase tracking-wider rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm text-xs"
                  >
                    {actionLoading ? (
                      <>
                        <LoaderRectangle />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="truncate">{selectedRequest.status === 'APPROVED' ? 'Update & Confirm' : 'Confirm & Deploy'}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200 select-none">
                    Read-Only
                  </span>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-md w-full shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-zinc-50">
              <h3 className="text-sm font-black text-red-600 uppercase tracking-wider">Decline Service Request</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="p-1 rounded hover:bg-black/5 text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRejectRequest} className="p-6 flex flex-col gap-4 text-xs">
              <p className="text-black/70 font-semibold leading-relaxed">
                Provide a reason for declining this request. This explanation will be immediately visible to {selectedRequest.client?.companyName} in their client portal.
              </p>
              <textarea
                rows={3}
                required
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Reason for declining (e.g., outside contracted geographical area, insufficient advance notice)..."
                className="p-2.5 border border-red-300 rounded-xl focus:outline-none focus:border-red-600 font-medium resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-3.5 py-2 border border-black/20 rounded-xl font-bold hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Physical Site Visit Scheduling Modal */}
      {isVisitModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-black rounded-2xl max-w-lg w-full shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-700" />
                <h3 className="text-sm font-black text-[#032031] uppercase tracking-wider">
                  Schedule Physical Site Visit
                </h3>
              </div>
              <button onClick={() => setIsVisitModalOpen(false)} className="p-1 rounded hover:bg-black/5 text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleVisitSubmit} className="p-6 flex flex-col gap-4 text-xs">
              {/* Site Details Overview */}
              <div className="p-3 bg-zinc-50 border border-black/10 rounded-xl flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-black/50">Target Property</span>
                <span className="font-bold text-[#032031] text-xs">{selectedRequest.propertyName}</span>
                <span className="text-black/70 text-[11px]">{selectedRequest.propertyAddress}</span>
              </div>

              {/* Assignee Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-black">
                  Assign Officer / Administrator <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={visitForm.visitAssigneeId}
                  onChange={(e) => setVisitForm({ ...visitForm, visitAssigneeId: e.target.value })}
                  className="p-2.5 border border-black/30 rounded-xl font-medium focus:outline-none focus:border-[#032031] bg-white"
                >
                  <option value="" disabled>Select officer to conduct visit...</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.firstName} {assignee.lastName} ({assignee.jobTitle}) - {assignee.email}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-black/50 font-medium">
                  The designated staff member will physically survey the property to confirm exact geofencing coordinates.
                </span>
              </div>

              {/* Visit Scheduled Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-black">
                  Site Visit Date & Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={visitForm.visitScheduledAt}
                  onChange={(e) => setVisitForm({ ...visitForm, visitScheduledAt: e.target.value })}
                  className="p-2.5 border border-black/30 rounded-xl font-medium focus:outline-none focus:border-[#032031] bg-white"
                />
              </div>

              {/* Assessment Instructions / Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-black">
                  Visit Survey Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={visitForm.adminFeedbackNotes}
                  onChange={(e) => setVisitForm({ ...visitForm, adminFeedbackNotes: e.target.value })}
                  placeholder="e.g., Verify gate access code, inspect emergency exit routes, confirm latitude/longitude perimeter coordinates..."
                  className="p-2.5 border border-black/30 rounded-xl font-medium focus:outline-none focus:border-[#032031] bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(false)}
                  className="px-3.5 py-2 border border-black/20 rounded-xl font-bold hover:bg-black/5 text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{actionLoading ? 'Scheduling...' : 'Save & Schedule Visit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. REDESIGNED PHYSICAL SITE SURVEY REPORT MODAL (Expanded 2-Column Responsive Layout) */}
      {isSurveyModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header: Fortress ASR Deep Navy Brand Style */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-[#032031] text-white shrink-0">
              <div className="flex items-center gap-3 truncate">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/15 text-emerald-400 shrink-0">
                  <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300">
                    On-Site Assessment & Physical Survey Report
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-white truncate">
                    {selectedRequest.propertyName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsSurveyModalOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                title="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Form with Responsive 2-Column Grid */}
            <form id="survey-report-form" onSubmit={handleSurveySubmit} className="flex flex-col flex-grow overflow-hidden">
              
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 text-xs text-slate-800 bg-white">
                
                {/* Left Column (7 cols on lg): Visual Spatial Calibration & Geofence Map */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  
                  {/* Property Brief Summary Card */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex flex-col truncate">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Target Survey Facility</span>
                      <span className="font-black text-[#032031] text-xs sm:text-sm truncate">{selectedRequest.propertyName}</span>
                      <span className="text-[11px] text-slate-600 truncate font-semibold">{selectedRequest.propertyAddress}</span>
                    </div>
                    {selectedRequest.client?.companyName && (
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-white border border-slate-200 text-[#032031] shrink-0">
                        {selectedRequest.client.companyName}
                      </span>
                    )}
                  </div>

                  {/* Interactive GPS Geofence Map Container */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                    
                    {/* Map Header with Quick GPS Actions */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-700" />
                        <span className="font-black text-[#032031] text-xs uppercase tracking-wider">
                          Actual On-Site GPS Location
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGetBrowserLocation}
                        disabled={locatingGps}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-100 text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Acquire live GPS coordinates from this device"
                      >
                        <Locate className={`w-3 h-3 ${locatingGps ? 'animate-spin' : ''}`} />
                        <span>{locatingGps ? 'Locating...' : 'Use Device GPS'}</span>
                      </button>
                    </div>

                    {/* High-Resolution Interactive Map */}
                    <div className="w-full">
                      <LocationPickerMap
                        latitude={surveyForm.surveyLatitude ? Number(surveyForm.surveyLatitude) : 51.5074}
                        longitude={surveyForm.surveyLongitude ? Number(surveyForm.surveyLongitude) : -0.1278}
                        radiusMeters={surveyForm.surveyGeofenceRadiusMeters || 100}
                        onChange={(lat, lng) => {
                          setSurveyForm((prev) => ({
                            ...prev,
                            surveyLatitude: lat,
                            surveyLongitude: lng,
                          }));
                        }}
                        height="320px"
                        zoom={17}
                        interactive={true}
                      />
                    </div>

                    {/* Calibrated Coordinates Readout */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-700 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 font-jakarta">Centerpoint:</span>
                        <span className="text-[#032031]">
                          {surveyForm.surveyLatitude && surveyForm.surveyLongitude 
                            ? `${Number(surveyForm.surveyLatitude).toFixed(6)}, ${Number(surveyForm.surveyLongitude).toFixed(6)}`
                            : '51.507400, -0.127800'}
                        </span>
                      </div>

                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-jakarta">
                        Pin Calibrated
                      </span>
                    </div>

                    {/* Geofence Radius Slider & Quick Select Pills */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                        <span>Geofence Boundary Radius</span>
                        <span className="text-emerald-700 font-bold font-mono text-xs">
                          {surveyForm.surveyGeofenceRadiusMeters} meters
                        </span>
                      </div>

                      <input
                        type="range"
                        min={25}
                        max={1000}
                        step={25}
                        value={surveyForm.surveyGeofenceRadiusMeters}
                        onChange={(e) => setSurveyForm({ ...surveyForm, surveyGeofenceRadiusMeters: parseInt(e.target.value, 10) })}
                        className="w-full accent-[#032031] cursor-pointer"
                      />

                      <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                        {[50, 100, 150, 200, 500].map((radius) => (
                          <button
                            type="button"
                            key={radius}
                            onClick={() => setSurveyForm({ ...surveyForm, surveyGeofenceRadiusMeters: radius })}
                            className={`py-1 rounded-md border text-[10px] font-black uppercase tracking-wider transition cursor-pointer text-center ${
                              surveyForm.surveyGeofenceRadiusMeters === radius
                                ? 'bg-[#032031] text-white border-[#032031]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {radius}m
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Right Column (5 cols on lg): On-Site Findings, Representative Met, and Inspection Schedule */}
                <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-5 lg:pt-0">
                  
                  {/* On-Site Contact Person Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      Client Representative Met On-Site
                    </span>

                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., David Miller (Site Manager)"
                          value={surveyForm.surveyContactName}
                          onChange={(e) => setSurveyForm({ ...surveyForm, surveyContactName: e.target.value })}
                          className="h-10 px-3 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] bg-white transition"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                          Direct Phone Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., +44 7911 123456"
                          value={surveyForm.surveyContactPhone}
                          onChange={(e) => setSurveyForm({ ...surveyForm, surveyContactPhone: e.target.value })}
                          className="h-10 px-3 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] bg-white transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Survey & Assessment Findings */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-2xs">
                    <span className="font-black text-[#032031] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      Survey Findings & Access Protocols
                    </span>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                        Physical Assessment Notes
                      </label>
                      <textarea
                        rows={4}
                        value={surveyForm.surveyNotes}
                        onChange={(e) => setSurveyForm({ ...surveyForm, surveyNotes: e.target.value })}
                        placeholder="Record key codes, perimeter blind spots, emergency shutoffs, guard checkpoint positions, lighting conditions..."
                        className="p-3 border border-slate-300 rounded-xl font-medium text-xs focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031] bg-white resize-none transition"
                      />
                    </div>
                  </div>

                  {/* Inspection Timestamp & Assigned Officer */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#032031] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                        Survey Execution Timestamp
                      </span>
                      {selectedRequest.visitAssignee && (
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[140px]">
                          By: {selectedRequest.visitAssignee.firstName} {selectedRequest.visitAssignee.lastName?.charAt(0)}.
                        </span>
                      )}
                    </div>

                    <input
                      type="datetime-local"
                      value={surveyForm.surveyConductedAt}
                      onChange={(e) => setSurveyForm({ ...surveyForm, surveyConductedAt: e.target.value })}
                      className="h-10 px-3 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#032031] bg-white transition"
                    />
                    <span className="text-[10px] text-slate-500 font-medium">
                      Saving marks this physical survey as complete and pre-populates coordinates for deployment.
                    </span>
                  </div>

                </div>

              </div>

              {/* Modal Actions Footer: Fully Responsive */}
              <div className="p-3.5 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Survey report will be archived in the security assessment log.
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSurveyModalOpen(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-300 rounded-xl font-bold hover:bg-slate-100 text-slate-700 text-xs transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="survey-report-form"
                    disabled={actionLoading}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
                  >
                    <ClipboardCheck className="w-4 h-4 text-emerald-200" />
                    <span>{actionLoading ? 'Saving Report...' : 'Save Survey Report'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SiteRequestsManagement;
