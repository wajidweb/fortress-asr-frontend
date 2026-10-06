'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { useUIStore } from '@/store/useUIStore';
import { getFullImageUrl } from '@/services/api';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Check, 
  AlertCircle, 
  Upload, 
  Trash2, 
  UserCheck, 
  Lock, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  ExternalLink,
  Shield
} from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  updateUser: (data: any) => void;
  setActiveMenu: (menu: string) => void;
  isProfileComplete: boolean;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  updateUser,
  setActiveMenu,
  isProfileComplete
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const rtwFileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useUIStore((state) => state.addToast);

  // Loading, fetching, and validation states
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Officer Photo State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

  // RTW Document File State
  const [rtwFile, setRtwFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  // Form inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    siaLicenceNumber: '',
    siaExpiryDate: '',
    rtwDocumentType: 'Passport',
    rtwExpiryDate: '',
    hasIndefiniteRtw: false,
    rtwDocumentUrl: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [createdAt, setCreatedAt] = useState<string | null>(null);

  // Fetch fresh decrypted details directly from DB on mount
  useEffect(() => {
    setFetching(true);
    authService.getMe()
      .then((res) => {
        const usr = res.user;
        const profile = usr.guardProfile || {};
        
        setFormData({
          firstName: usr.firstName || '',
          lastName: usr.lastName || '',
          phoneNumber: usr.phoneNumber || profile.phoneNumber || '',
          siaLicenceNumber: profile.siaLicenceNumber || '',
          siaExpiryDate: profile.siaExpiryDate ? new Date(profile.siaExpiryDate).toISOString().split('T')[0] : '',
          rtwDocumentType: profile.rtwDocumentType || 'Passport',
          rtwExpiryDate: profile.rightToWorkExpiryDate ? new Date(profile.rightToWorkExpiryDate).toISOString().split('T')[0] : '',
          hasIndefiniteRtw: !!profile.hasIndefiniteRTW,
          rtwDocumentUrl: profile.rtwDocumentUrl || '',
          emergencyContactName: profile.emergencyContactName || '',
          emergencyContactPhone: profile.emergencyContactPhone || '',
        });

        if (profile.profilePictureUrl) {
          setPhotoPreview(profile.profilePictureUrl);
        }

        setCreatedAt(profile.createdAt || usr.createdAt || null);
        updateUser(usr);
      })
      .catch(() => {
        setError('Failed to fetch decrypted profile details from database.');
      })
      .finally(() => {
        setFetching(false);
      });
  }, [updateUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        ...(name === 'hasIndefiniteRtw' && checked ? { rtwExpiryDate: '' } : {})
      }));
    } else if (name === 'siaLicenceNumber') {
      const cleanVal = value.replace(/[^0-9]/g, '').slice(0, 16);
      setFormData(prev => ({ ...prev, siaLicenceNumber: cleanVal }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          photo: 'Officer photo exceeds 10MB limit. Please upload a smaller image.'
        }));
        return;
      }

      const allowed = /\.(jpg|jpeg|png|webp|svg)$/i;
      if (!allowed.test(file.name)) {
        setValidationErrors(prev => ({
          ...prev,
          photo: 'Invalid format. Only PNG, JPG, and WEBP formats are allowed.'
        }));
        return;
      }

      setPhotoFile(file);
      setIsPhotoRemoved(false);
      setPhotoPreview(URL.createObjectURL(file));
      setValidationErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setIsPhotoRemoved(true);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleRtwFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setValidationErrors(prev => ({ ...prev, rtwDocument: '' }));

      if (file.size > 50 * 1024 * 1024) {
        setValidationErrors(prev => ({ 
          ...prev, 
          rtwDocument: 'Document file exceeds 50MB size limit. Please upload a compressed scan.' 
        }));
        setRtwFile(null);
        setSelectedFileName('');
        return;
      }

      const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.pdf)$/i;
      if (!allowedExtensions.exec(file.name)) {
        setValidationErrors(prev => ({ 
          ...prev, 
          rtwDocument: 'Invalid format! Only JPG, PNG, and PDF documents are allowed.' 
        }));
        setRtwFile(null);
        setSelectedFileName('');
        return;
      }

      setRtwFile(file);
      setSelectedFileName(file.name);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required.';
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required.';
      isValid = false;
    }

    const phoneRegex = /^[+]?[0-9\s-]{5,20}$/;
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Contact phone number is required.';
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Invalid contact format (allowed: numbers, spaces, and optional + prefix).';
      isValid = false;
    }

    if (!formData.siaLicenceNumber.trim()) {
      errors.siaLicenceNumber = 'SIA Licence Number is required.';
      isValid = false;
    } else if (formData.siaLicenceNumber.trim().length !== 16) {
      errors.siaLicenceNumber = 'SIA Licence Number must be exactly 16 numerical digits.';
      isValid = false;
    }

    if (!formData.siaExpiryDate) {
      errors.siaExpiryDate = 'SIA Expiry Date is required.';
      isValid = false;
    }

    if (!formData.rtwDocumentType.trim()) {
      errors.rtwDocumentType = 'Right to Work document type is required.';
      isValid = false;
    }

    if (!formData.hasIndefiniteRtw && !formData.rtwExpiryDate) {
      errors.rtwExpiryDate = 'Expiry date is required unless Indefinite Right to Work is selected.';
      isValid = false;
    }

    if (!formData.rtwDocumentUrl && !rtwFile) {
      errors.rtwDocument = 'Please upload a physical copy of your Right to Work document (PDF, JPG, or PNG).';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const multipartPayload = new FormData();
      multipartPayload.append('firstName', formData.firstName.trim());
      multipartPayload.append('lastName', formData.lastName.trim());
      multipartPayload.append('phoneNumber', formData.phoneNumber.trim());
      multipartPayload.append('siaLicenceNumber', formData.siaLicenceNumber.trim());
      multipartPayload.append('siaExpiryDate', formData.siaExpiryDate);
      multipartPayload.append('rtwDocumentType', formData.rtwDocumentType);
      multipartPayload.append('hasIndefiniteRtw', String(formData.hasIndefiniteRtw));
      
      if (formData.hasIndefiniteRtw) {
        multipartPayload.append('rtwExpiryDate', '');
      } else {
        multipartPayload.append('rtwExpiryDate', formData.rtwExpiryDate);
      }

      if (formData.emergencyContactName.trim()) {
        multipartPayload.append('emergencyContactName', formData.emergencyContactName.trim());
      }
      if (formData.emergencyContactPhone.trim()) {
        multipartPayload.append('emergencyContactPhone', formData.emergencyContactPhone.trim());
      }

      // RTW Document scan attachment
      if (rtwFile) {
        multipartPayload.append('rtwDocument', rtwFile);
      } else {
        multipartPayload.append('rtwDocumentUrl', formData.rtwDocumentUrl);
      }

      // Officer Photo attachment
      if (photoFile) {
        multipartPayload.append('photo', photoFile);
      } else if (isPhotoRemoved) {
        multipartPayload.append('profilePictureUrl', '');
      }

      const res = await authService.updateGuardProfile(multipartPayload);
      updateUser(res.user);

      setIsPhotoRemoved(false);
      setPhotoFile(null);
      setRtwFile(null);
      if (res.user?.guardProfile?.profilePictureUrl) {
        setPhotoPreview(res.user.guardProfile.profilePictureUrl);
      } else if (isPhotoRemoved) {
        setPhotoPreview('');
      }

      setSuccess(true);
      addToast('Officer profile and credentials updated successfully!', 'success');

      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err: any) {
      const errMsg = Array.isArray(err.data?.error)
        ? err.data.error.map((e: any) => e.message).join(', ')
        : (err.message || 'An error occurred during profile verification.');
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatAccountDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Active Officer';
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

  const getInitials = () => {
    const f = formData.firstName ? formData.firstName[0] : (user.firstName ? user.firstName[0] : '');
    const l = formData.lastName ? formData.lastName[0] : (user.lastName ? user.lastName[0] : '');
    return (f + l).toUpperCase() || 'SO';
  };

  if (fetching) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-20 text-black select-none text-[10px] font-black uppercase tracking-wider min-h-[400px] gap-4">
        <LoaderRectangle />
        <span>Loading Officer Profile...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-black font-jakarta pb-16">
      
      {/* Top Notification Alerts */}
      {success && (
        <div className="w-full bg-black text-white p-4 rounded-md border-2 border-black flex items-center gap-3 animate-fade-in shadow-sm">
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-wider">Officer Credentials Successfully Synchronized</p>
            <p className="text-[10px] text-white/80 font-medium">Compliance records and licensing credentials have been authenticated and saved.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full bg-red-50 text-red-700 p-4 rounded-md border-2 border-red-600 flex items-center gap-3 animate-fade-in shadow-sm">
          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-wider text-red-900">Verification Error</p>
            <p className="text-[10px] text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Main Full-Width Form Container */}
      <form onSubmit={handleSaveProfile} className="w-full bg-white border-2 border-black rounded-lg p-6 sm:p-10 flex flex-col gap-8 shadow-sm">
        
        {/* Header Block with Proper Black Accents */}
        <div className="w-full border-b-2 border-black pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-black">
              Fortress ASR Security Systems • Officer Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
              Officer Profile & Compliance Credentials
            </h1>
            <p className="text-xs text-black/70 font-bold">
              Manage personal officer details, SIA licence verification, and right to work documentation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {createdAt && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-black rounded-sm bg-white" title="Official registration date">
                <Clock className="w-3.5 h-3.5 text-black" />
                <span className="text-[9px] text-black font-bold uppercase tracking-wider">
                  Member Since: <strong className="font-black">{formatAccountDate(createdAt)}</strong>
                </span>
              </div>
            )}

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-white ${isProfileComplete ? 'bg-black' : 'bg-red-600'}`}>
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-wider">
                Status: {isProfileComplete ? 'SIA Verified' : 'Pending Audit'}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Inputs Per Line On Large Screens (grid grid-cols-1 md:grid-cols-2) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">

          {/* 1. Officer Profile Photo Upload (Full Width on Top: md:col-span-2) */}
          <div className="w-full md:col-span-2 flex flex-col gap-3 pb-7 border-b border-black/15">
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">
                Officer Profile Photo
              </label>
              <span className="text-[9px] text-black/60 font-semibold">
                Upload your official security officer portrait (PNG, JPG, or WEBP up to 10MB). This photo is displayed on supervisor dispatch rosters and site check-in credentials.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-1">
              {/* Avatar Box with Proper Black Border */}
              <div className="w-24 h-24 rounded-lg bg-black/5 border-2 border-black flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getFullImageUrl(photoPreview)}
                    alt="Officer Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-black">
                    <span className="text-xl font-black">{getInitials()}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-black/50 mt-0.5">No Photo</span>
                  </div>
                )}
              </div>

              {/* Upload & Remove Controls */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoChange}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-4 py-2 bg-black hover:bg-black/85 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{photoPreview ? 'Change Photo' : 'Upload Officer Photo'}</span>
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3.5 py-2 border border-black text-black hover:bg-black hover:text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {validationErrors.photo && (
                  <span className="text-red-600 text-[9px] font-black">{validationErrors.photo}</span>
                )}
              </div>
            </div>
          </div>

          {/* Line 1 - Left: First Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. John"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
            {validationErrors.firstName && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.firstName}</span>
            )}
          </div>

          {/* Line 1 - Right: Last Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Smith"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
            {validationErrors.lastName && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.lastName}</span>
            )}
          </div>

          {/* Line 2 - Left: Primary Contact Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Primary Contact Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. +44 7123 456789"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Direct officer mobile number utilized for shift assignments and emergency check-ins.
            </span>
            {validationErrors.phoneNumber && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.phoneNumber}</span>
            )}
          </div>

          {/* Line 2 - Right: Account Email Address (Read-Only) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">
                Account Email Address (System Locked)
              </label>
              <span className="text-[8px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Read Only
              </span>
            </div>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-4 py-3 border border-black/30 rounded-md text-xs font-bold text-black bg-black/5 cursor-not-allowed select-all"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Immutable officer system identifier. Contact administration if email transfer is needed.
            </span>
          </div>

          {/* Line 3 - Left: SIA Licence Number */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">
                SIA Licence Number *
              </label>
              <span className="text-[9px] font-black text-black">
                {formData.siaLicenceNumber.length} / 16 digits
              </span>
            </div>
            <input
              type="text"
              name="siaLicenceNumber"
              required
              maxLength={16}
              value={formData.siaLicenceNumber}
              onChange={handleChange}
              placeholder="16-digit numerical SIA badge number"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition tracking-widest font-mono"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Must be exactly 16 digits printed on your official Security Industry Authority badge.
            </span>
            {validationErrors.siaLicenceNumber && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.siaLicenceNumber}</span>
            )}
          </div>

          {/* Line 3 - Right: SIA Licence Expiry Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              SIA Licence Expiry Date *
            </label>
            <input
              type="date"
              name="siaExpiryDate"
              required
              value={formData.siaExpiryDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Exact expiration date displayed on your physical SIA licence card.
            </span>
            {validationErrors.siaExpiryDate && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.siaExpiryDate}</span>
            )}
          </div>

          {/* Line 4 - Left: Right to Work Document Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Right to Work Document Type *
            </label>
            <select
              name="rtwDocumentType"
              required
              value={formData.rtwDocumentType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black transition cursor-pointer"
            >
              <option value="Passport">Passport (British / International)</option>
              <option value="Biometric Residence Permit (BRP)">Biometric Residence Permit (BRP)</option>
              <option value="UK Birth Certificate">UK Birth / Adoption Certificate</option>
              <option value="Home Office Share Code">Home Office Online Share Code</option>
            </select>
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Statutory verification document establishing legal right to work in the United Kingdom.
            </span>
          </div>

          {/* Line 4 - Right: Right to Work Expiry Date & Indefinite Checkbox */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">
                Right to Work Expiry Date {formData.hasIndefiniteRtw ? '(Indefinite)' : '*'}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="hasIndefiniteRtw"
                  checked={formData.hasIndefiniteRtw}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 accent-black rounded cursor-pointer"
                />
                <span className="text-[9px] font-black uppercase tracking-wider text-black">Indefinite (No Expiry)</span>
              </label>
            </div>
            <input
              type="date"
              name="rtwExpiryDate"
              disabled={formData.hasIndefiniteRtw}
              value={formData.rtwExpiryDate}
              onChange={handleChange}
              className={`w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black transition ${
                formData.hasIndefiniteRtw ? 'bg-black/5 border-black/30 text-black/40 cursor-not-allowed' : ''
              }`}
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              {formData.hasIndefiniteRtw
                ? 'Indefinite leave to remain selected - no expiration required.'
                : 'Date when your current visa or right to work permission terminates.'}
            </span>
            {validationErrors.rtwExpiryDate && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.rtwExpiryDate}</span>
            )}
          </div>

          {/* Line 5 - Left: Emergency Contact Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Emergency Contact Name <span className="font-normal text-black/60">(Optional)</span>
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="e.g. Sarah Smith (Spouse)"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Designated next of kin or emergency point of contact.
            </span>
          </div>

          {/* Line 5 - Right: Emergency Contact Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Emergency Contact Phone <span className="font-normal text-black/60">(Optional)</span>
            </label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              placeholder="e.g. +44 7987 654321"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Telephone line for immediate contact in medical or site emergencies.
            </span>
          </div>

          {/* Line 6: Physical Right to Work Document Scan Upload (Full Width: md:col-span-2) */}
          <div className="w-full md:col-span-2 flex flex-col gap-3 pt-3 pb-3 border-t border-black/15">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">
                Physical Right to Work Document Scan *
              </label>
              {formData.rtwDocumentUrl && (
                <a
                  href={getFullImageUrl(formData.rtwDocumentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-black uppercase tracking-wider text-black flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Current Scan</span>
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="file"
                ref={rtwFileInputRef}
                onChange={handleRtwFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => rtwFileInputRef.current?.click()}
                className="px-5 py-2.5 border-2 border-black bg-white hover:bg-black hover:text-white text-black rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{selectedFileName ? 'Change Document File' : (formData.rtwDocumentUrl ? 'Replace Scan Document' : 'Upload Document Scan')}</span>
              </button>

              <div className="flex flex-col">
                <span className="text-xs font-bold text-black">
                  {selectedFileName ? selectedFileName : (formData.rtwDocumentUrl ? 'Compliant document verified on record' : 'No document file selected')}
                </span>
                <span className="text-[9px] text-black/60 font-medium">
                  Accepted formats: PDF, JPG, PNG (Maximum file size: 50MB)
                </span>
              </div>
            </div>

            {validationErrors.rtwDocument && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.rtwDocument}</span>
            )}
          </div>

        </div>

        {/* Bottom Submission Bar */}
        <div className="w-full pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-black text-[10px] font-bold">
            <ShieldCheck className="w-4 h-4 text-black shrink-0" />
            <span>Compliance credentials and officer documentation are cryptographically secured and audited.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3.5 bg-black hover:bg-black/90 text-white text-xs font-black uppercase tracking-widest rounded-md transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {loading ? (
              <>
               
                <span>Saving Credentials...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Save Officer Profile</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default ProfileSettings;
