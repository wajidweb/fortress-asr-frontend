'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { Check, Upload, FileText, Globe, AlertCircle, Shield } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading, fetching, and validation states
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Local form state - Initialized with blank defaults
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
  });

  // Local file upload states
  const [rtwFile, setRtwFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  // HITS GETME API DIRECTLY ON MOUNT: Fetches fresh decrypted details directly from DB, bypassing local storage completely
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
        });

        // Sync Zustand store with fresh decrypted DB snapshot
        updateUser(usr);
      })
      .catch((err) => {
        setError('Failed to fetch fresh decrypted profile details from database.');
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
        // If indefinite is selected, clear rtwExpiryDate
        ...(name === 'hasIndefiniteRtw' && checked ? { rtwExpiryDate: '' } : {})
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear specific validation error on change
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Clear file errors
      setValidationErrors(prev => ({ ...prev, rtwDocument: '' }));

      // 1. Validate File Size (Strict 50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setValidationErrors(prev => ({ 
          ...prev, 
          rtwDocument: 'File exceeds 50MB size limit. Please upload a smaller compressed scan.' 
        }));
        setRtwFile(null);
        setSelectedFileName('');
        return;
      }

      // 2. Validate File Type (JPG, PNG, PDF)
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

  // Strict client-side validation logic
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // 1. Name Check
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required.';
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required.';
      isValid = false;
    }

    // 2. Phone Number Format (Digits, spaces, hyphens, and starting + only)
    const phoneRegex = /^[+]?[0-9\s-]{5,20}$/;
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid contact format. (Allowed: numbers, spaces, and optional + starting prefix).';
      isValid = false;
    }

    // 3. SIA Licence Number (Must be exactly 16 numeric digits)
    const numericRegex = /^[0-9]+$/;
    if (!formData.siaLicenceNumber.trim()) {
      errors.siaLicenceNumber = 'SIA badge number is required.';
      isValid = false;
    } else if (formData.siaLicenceNumber.length !== 16 || !numericRegex.test(formData.siaLicenceNumber)) {
      errors.siaLicenceNumber = 'Invalid licence! Must be exactly 16 numeric digits.';
      isValid = false;
    }

    // 4. SIA Licence Expiry Date (Must be a valid future date)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset clock time for accurate date comparisons
    
    if (!formData.siaExpiryDate) {
      errors.siaExpiryDate = 'SIA Expiry date is required.';
      isValid = false;
    } else {
      const siaExpiry = new Date(formData.siaExpiryDate);
      if (siaExpiry <= today) {
        errors.siaExpiryDate = 'Expired badge! SIA licence expiry must be a valid future date.';
        isValid = false;
      }
    }

    // 5. Right to Work Expiry Date (Must be a future date unless indefinite)
    if (!formData.hasIndefiniteRtw) {
      if (!formData.rtwExpiryDate) {
        errors.rtwExpiryDate = 'Work permit expiry date is required.';
        isValid = false;
      } else {
        const rtwExpiry = new Date(formData.rtwExpiryDate);
        if (rtwExpiry <= today) {
          errors.rtwExpiryDate = 'Expired permit! Visa expiry must be a valid future date.';
          isValid = false;
        }
      }
    }

    // 6. Enforce File Scan Upload on first-time setup
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

    // Run strict client-side validation gates
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Assemble multipart FormData payload
      const multipartPayload = new FormData();
      multipartPayload.append('firstName', formData.firstName);
      multipartPayload.append('lastName', formData.lastName);
      multipartPayload.append('phoneNumber', formData.phoneNumber);
      multipartPayload.append('siaLicenceNumber', formData.siaLicenceNumber);
      multipartPayload.append('siaExpiryDate', formData.siaExpiryDate);
      multipartPayload.append('rtwDocumentType', formData.rtwDocumentType);
      multipartPayload.append('hasIndefiniteRtw', String(formData.hasIndefiniteRtw));
      
      if (formData.hasIndefiniteRtw) {
        multipartPayload.append('rtwExpiryDate', '');
      } else {
        multipartPayload.append('rtwExpiryDate', formData.rtwExpiryDate);
      }

      // If a new file is uploaded, stream its binary
      if (rtwFile) {
        multipartPayload.append('rtwDocument', rtwFile);
      } else {
        // Pass existing URL fallback string
        multipartPayload.append('rtwDocumentUrl', formData.rtwDocumentUrl);
      }

      // Call API PUT endpoint utilizing boundary FormData stream
      const res = await authService.updateGuardProfile(multipartPayload);
      
      // Update state in Zustand store
      updateUser(res.user);
      
      setSuccess(true);
      
      // Transition back to Shifts terminal after a short delay
      setTimeout(() => {
        setActiveMenu('my-shifts');
      }, 1500);

    } catch (err: any) {
      if (Array.isArray(err.data?.error)) {
        setError(err.data.error.map((e: any) => e.message).join(', '));
      } else {
        const rawMessage = err.message || '';
        if (rawMessage.includes('Unexpected token') || rawMessage.includes('large') || err.status === 413) {
          setError('The uploaded document scan file is too large or has an invalid structure. Please ensure your PDF or image is under 50MB and try again.');
        } else {
          setError(err.message || 'An error occurred during profile verification. Please check your licence details and try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to format backend local static uploads links cleanly
  const getFullDocumentUrl = (path: string) => {
    if (!path) return '';
    const apiHost = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001';
    return `${apiHost}${path}`;
  };

  // Renders a beautiful inline skeleton loader while fetching fresh decrypted details from DB
  if (fetching) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-20 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[400px] gap-4">
        <LoaderRectangle />
        <span>Syncing Decrypted Database Snapshots...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-black font-jakarta pb-12 select-none">
      
      {/* Success / Error Banners */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md text-[10px] font-black uppercase tracking-wider leading-relaxed flex items-center gap-2 select-none animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Onboard records successfully synchronized! Returning to shifts...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-[10px] font-black uppercase tracking-wider leading-relaxed flex items-center gap-2 select-none animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 25-Years Experience UI/UX Designer Masterpiece: One Unified Swiss-Modernist Form Container */}
      <form onSubmit={handleSaveProfile} className="w-full bg-white border border-slate-200 rounded-lg p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
        
        {/* Geometric Header Block */}
        <div className="border-b border-slate-100 pb-5 select-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-black leading-none">Officer Account Update Portal</span>
            <h2 className="text-sm font-black text-[#032031] tracking-tight leading-none mt-1.5">Compliance Credentials & Personal Records</h2>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#032031]/5 border border-[#032031]/10 rounded-sm">
            <Shield className="w-3 h-3 text-[#032031]" />
            <span className="text-[8px] text-[#032031] font-black uppercase tracking-wider">
              Audit Status: {isProfileComplete ? 'SIA Verified' : 'Pending Audit'}
            </span>
          </div>
        </div>

        {/* Unified, continuous form inputs grid (with strictly text-black labels) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6">
          
          {/* First Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">First Name</label>
            <input 
              type="text" 
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition"
            />
            {validationErrors.firstName && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Last Name</label>
            <input 
              type="text" 
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition"
            />
            {validationErrors.lastName && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.lastName}</span>
            )}
          </div>

          {/* Contact Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Contact Number</label>
            <input 
              type="tel" 
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. +44 7123 456789"
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition"
            />
            {validationErrors.phoneNumber && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.phoneNumber}</span>
            )}
          </div>

          {/* Email (Disabled, system-locked) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Email Address</label>
            <input 
              type="email" 
              disabled
              value={user.email}
              className="w-full px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold bg-slate-50 text-slate-400 select-none cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* SIA Licence Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">SIA Licence Number</label>
            <input 
              type="text" 
              name="siaLicenceNumber"
              required
              value={formData.siaLicenceNumber}
              onChange={handleChange}
              placeholder="16 Digit Licence Number"
              maxLength={16}
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black uppercase tracking-wider transition"
            />
            {validationErrors.siaLicenceNumber && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.siaLicenceNumber}</span>
            )}
          </div>

          {/* SIA Expiry Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">SIA Expiry Date</label>
            <input 
              type="date" 
              name="siaExpiryDate"
              required
              value={formData.siaExpiryDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition"
            />
            {validationErrors.siaExpiryDate && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.siaExpiryDate}</span>
            )}
          </div>

          {/* RTW Document Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">RTW Document Type</label>
            <select 
              name="rtwDocumentType"
              value={formData.rtwDocumentType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition cursor-pointer"
            >
              <option value="Passport">UK Passport</option>
              <option value="Biometric Residence Permit (BRP)">Biometric Residence Permit (BRP)</option>
              <option value="EU Settlement Share Code">EU Settlement Share Code</option>
              <option value="Work Visa">Work Visa</option>
            </select>
          </div>

          {/* RTW Expiry Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Visa / Permit Expiry Date</label>
            <input 
              type="date" 
              name="rtwExpiryDate"
              disabled={formData.hasIndefiniteRtw}
              value={formData.rtwExpiryDate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition disabled:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed`}
            />
            {validationErrors.rtwExpiryDate && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.rtwExpiryDate}</span>
            )}
          </div>

          {/* Indefinite RTW Checkbox */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Work-Permit Override</label>
            <label className="flex items-center gap-2.5 p-2.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 cursor-pointer select-none transition h-[38px]">
              <input 
                type="checkbox" 
                name="hasIndefiniteRtw"
                checked={formData.hasIndefiniteRtw}
                onChange={handleChange}
                className="w-3.5 h-3.5 rounded text-[#032031] border-slate-300 focus:ring-[#032031]"
              />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-wider text-black">Indefinite Right to Work</span>
              </div>
            </label>
          </div>

          {/* Document Scan Upload File Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">RTW Secure Document Scan (PDF, JPG, PNG)</label>
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf, .jpg, .jpeg, .png"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 border border-black rounded-md text-[9px] font-black uppercase tracking-wider text-[#032031] hover:bg-slate-50 transition shadow-xs shrink-0"
              >
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
              </button>
              <div className="flex flex-col min-w-0">
                {selectedFileName ? (
                  <span className="text-[9px] font-bold text-black truncate max-w-[150px]">{selectedFileName}</span>
                ) : formData.rtwDocumentUrl ? (
                  <a 
                    href={getFullDocumentUrl(formData.rtwDocumentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-[#032031] font-black underline flex items-center gap-1 hover:text-black transition truncate max-w-[150px]"
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">View Uploaded Scan</span>
                  </a>
                ) : (
                  <span className="text-[8px] text-red-500 font-black uppercase">No File uploaded</span>
                )}
              </div>
            </div>
            {validationErrors.rtwDocument && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-1">{validationErrors.rtwDocument}</span>
            )}
          </div>

        </div>

        {/* Divider and Footer Details */}
        <div className="border-t border-slate-100 pt-5 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[7.5px] font-bold uppercase tracking-wider">
              Strict British Compliance Lock. SIA badges tracked under three-year renewal intervals.
            </span>
          </div>

          {/* Form Actions Button Row */}
          <div className="flex items-center gap-3 select-none ml-auto">
            {isProfileComplete && (
              <button 
                type="button"
                disabled={loading}
                onClick={() => setActiveMenu('my-shifts')}
                className="px-5 py-2 border border-black text-[#032031] rounded-md text-[9px] font-black uppercase tracking-wider transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 bg-[#032031] hover:bg-black text-white rounded-md text-[9px] font-black uppercase tracking-wider transition duration-300 shadow-sm flex items-center gap-1.5 disabled:opacity-75"
            >
              {loading ? (
                <div className="flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Auditing...</span>
                </div>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default ProfileSettings;
