'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { authService } from '@/services/auth.service';
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
  Building2
} from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  updateUser: (data: any) => void;
  setActiveMenu: (menu: string) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  updateUser,
  setActiveMenu,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useUIStore((state) => state.addToast);

  // Loading, fetching, and validation states
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Client photo / entity logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: '',
    billingAddress: '',
    contactPerson: '',
    contactPhone: '',
  });

  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const isProfileComplete = !!(formData.companyName && formData.firstName && formData.lastName && formData.phoneNumber);

  // Fetch fresh decrypted details directly from DB on mount
  useEffect(() => {
    setFetching(true);
    authService.getMe()
      .then((res) => {
        const usr = res.user;
        const profile = usr.clientProfile || {};

        setFormData({
          firstName: usr.firstName || '',
          lastName: usr.lastName || '',
          phoneNumber: usr.phoneNumber || profile.contactPhone || '',
          companyName: profile.companyName || '',
          billingAddress: profile.billingAddress || '',
          contactPerson: profile.contactPerson || (usr.firstName && usr.lastName ? `${usr.firstName} ${usr.lastName}` : ''),
          contactPhone: profile.contactPhone || usr.phoneNumber || '',
        });

        if (profile.logoUrl) {
          setLogoPreview(profile.logoUrl);
        }

        setCreatedAt(profile.createdAt || usr.createdAt || null);
        updateUser(usr);
      })
      .catch(() => {
        setError('Failed to fetch profile details from database.');
      })
      .finally(() => {
        setFetching(false);
      });
  }, [updateUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'companyName') {
      setFormData((prev) => ({ ...prev, companyName: value.slice(0, 150) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate File Size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          image: 'Image file exceeds 10MB limit. Please upload a smaller file.',
        }));
        return;
      }

      // Validate Image Type
      const allowed = /\.(jpg|jpeg|png|webp|svg)$/i;
      if (!allowed.test(file.name)) {
        setValidationErrors((prev) => ({
          ...prev,
          image: 'Invalid image format. Allowed formats: PNG, JPG, WEBP, SVG.',
        }));
        return;
      }

      setLogoFile(file);
      setIsImageRemoved(false);
      setLogoPreview(URL.createObjectURL(file));
      setValidationErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleRemoveImage = () => {
    setLogoFile(null);
    setLogoPreview('');
    setIsImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      errors.phoneNumber = 'Mobile number is required.';
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Invalid contact format (allowed: numbers, spaces, and optional + prefix).';
      isValid = false;
    }

    if (!formData.companyName.trim()) {
      errors.companyName = 'Company, organization, or home / property name is required.';
      isValid = false;
    } else if (formData.companyName.length > 150) {
      errors.companyName = 'Entity name must not exceed 150 characters.';
      isValid = false;
    }

    if (!formData.billingAddress.trim()) {
      errors.billingAddress = 'Billing and service address is required.';
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
      let res;
      if (logoFile) {
        // Send multipart FormData with uploaded image file
        const bodyFormData = new FormData();
        bodyFormData.append('firstName', formData.firstName.trim());
        bodyFormData.append('lastName', formData.lastName.trim());
        bodyFormData.append('phoneNumber', formData.phoneNumber.trim());
        bodyFormData.append('companyName', formData.companyName.trim());
        bodyFormData.append('billingAddress', formData.billingAddress.trim());
        if (formData.contactPerson.trim()) {
          bodyFormData.append('contactPerson', formData.contactPerson.trim());
        }
        if (formData.contactPhone.trim()) {
          bodyFormData.append('contactPhone', formData.contactPhone.trim());
        }
        bodyFormData.append('logo', logoFile);

        res = await authService.updateClientProfile(bodyFormData);
      } else {
        // Send JSON payload
        const payload: Record<string, any> = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          companyName: formData.companyName.trim(),
          billingAddress: formData.billingAddress.trim(),
          contactPerson: formData.contactPerson.trim() || undefined,
          contactPhone: formData.contactPhone.trim() || undefined,
        };

        if (isImageRemoved) {
          payload.logoUrl = '';
        }

        res = await authService.updateClientProfile(payload);
      }

      updateUser(res.user);
      setIsImageRemoved(false);
      setLogoFile(null);
      if (res.user?.clientProfile?.logoUrl) {
        setLogoPreview(res.user.clientProfile.logoUrl);
      } else if (isImageRemoved) {
        setLogoPreview('');
      }

      setSuccess(true);
      addToast('Client profile updated successfully!', 'success');
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err: any) {
      const errMsg = Array.isArray(err.data?.error)
        ? err.data.error.map((e: any) => e.message).join(', ')
        : (err.message || 'An error occurred during profile update. Please try again.');
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatAccountDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Active Account';
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
    return (f + l).toUpperCase() || 'CP';
  };

  if (fetching) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-20 text-black select-none text-[10px] font-black uppercase tracking-wider min-h-[400px] gap-4">
        <LoaderRectangle />
        <span>Loading Client Profile...</span>
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
            <p className="font-black text-xs uppercase tracking-wider">Client Profile Successfully Synchronized</p>
            <p className="text-[10px] text-white/80 font-medium">Your updated records and credentials have been recorded to the database.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full bg-red-50 text-red-700 p-4 rounded-md border-2 border-red-600 flex items-center gap-3 animate-fade-in shadow-sm">
          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-wider text-red-900">Update Error</p>
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
              Fortress ASR Security Systems • Client Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
              Client Profile & Account Details
            </h1>
            <p className="text-xs text-black/70 font-bold">
              Update authorized contact personnel, property or business entity credentials, and billing information.
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

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-sm">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-wider">
                Status: {isProfileComplete ? 'Active Client' : 'Incomplete Profile'}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Inputs Per Line On Large Screens (grid grid-cols-1 md:grid-cols-2) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">

          {/* 1. Client Photo / Entity Logo (Full Width on Top: md:col-span-2) */}
          <div className="w-full md:col-span-2 flex flex-col gap-3 pb-7 border-b border-black/15">
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">
                Profile Photo / Entity Logo
              </label>
              <span className="text-[9px] text-black/60 font-semibold">
                Upload your personal photo or official organization logo (PNG, JPG, WEBP, or SVG up to 10MB).
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-1">
              {/* Avatar Box with Proper Black Border */}
              <div className="w-24 h-24 rounded-lg bg-black/5 border-2 border-black flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getFullImageUrl(logoPreview)}
                    alt="Client Avatar / Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-black">
                    <span className="text-xl font-black">{getInitials()}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-black/50 mt-0.5">No Image</span>
                  </div>
                )}
              </div>

              {/* Upload & Remove Controls */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-black hover:bg-black/85 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{logoPreview ? 'Change Photo / Logo' : 'Upload Photo / Logo'}</span>
                  </button>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3.5 py-2 border border-black text-black hover:bg-black hover:text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {validationErrors.image && (
                  <span className="text-red-600 text-[9px] font-black">{validationErrors.image}</span>
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

          {/* Line 2 - Left: Primary Mobile Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Primary Mobile Number *
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
              Direct mobile number used for emergency dispatches, alerts, and verification.
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
              Unique system identifier. Contact administration if an email transfer is required.
            </span>
          </div>

          {/* Line 3 - Left: Company / Organization / Home or Property Name */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">
                Company / Organization / Home or Property Name *
              </label>
              <span className="text-[9px] font-black text-black">
                {formData.companyName.length} / 150
              </span>
            </div>
            <input
              type="text"
              name="companyName"
              required
              maxLength={150}
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Apex Security Estates Ltd, Riverside Corporate Tower, or Kensington Residence"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Official entity name used on contracts, patrol orders, and billing invoices.
            </span>
            {validationErrors.companyName && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.companyName}</span>
            )}
          </div>

          {/* Line 3 - Right: Designated Site Contact Person */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Designated Site Contact / Operations Lead <span className="font-normal text-black/60">(Optional)</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. David Clarke (Head of Facilities & Security)"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Contact officer whom guards or supervisors should consult on site.
            </span>
          </div>

          {/* Line 4 - Left: Alternative Direct / Office Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Alternative Office / Direct Landline Phone <span className="font-normal text-black/60">(Optional)</span>
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="e.g. +44 20 7946 0958"
              className="w-full px-4 py-3 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Secondary office switchboard or direct desk line.
            </span>
          </div>

          {/* Line 4 - Right: Corporate Billing & Service Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">
              Corporate Billing & Service Address *
            </label>
            <textarea
              name="billingAddress"
              required
              rows={3}
              value={formData.billingAddress}
              onChange={handleChange}
              placeholder="e.g. Suite 4B, Tower Bridge Business Complex, London, SE1 2UP, United Kingdom"
              className="w-full px-4 py-2.5 border border-black rounded-md text-xs font-bold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/40 transition resize-none"
            />
            <span className="text-[9px] text-black/60 font-medium pl-1">
              Official physical billing location for invoice calculations and contracts.
            </span>
            {validationErrors.billingAddress && (
              <span className="text-red-600 text-[9px] font-black pl-1">{validationErrors.billingAddress}</span>
            )}
          </div>

        </div>

        {/* Bottom Submission Bar */}
        <div className="w-full pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-black text-[10px] font-bold">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>Profile updates are strictly authenticated and logged to immutable audit records.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3.5 bg-black hover:bg-black/90 text-white text-xs font-black uppercase tracking-widest rounded-md transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {loading ? (
              <>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Save Client Profile</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default ProfileSettings;
