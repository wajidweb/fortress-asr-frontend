'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { Check, AlertCircle, Building2, UserCheck } from 'lucide-react';

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
  // Loading, fetching, and validation states
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Local form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: '',
    billingAddress: '',
    contactPerson: '',
    contactPhone: '',
  });

  const isProfileComplete = !!(user?.clientProfile?.companyName);

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
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
      errors.phoneNumber = 'Phone number is required.';
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Invalid contact format (allowed: numbers, spaces, and optional + prefix).';
      isValid = false;
    }

    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required.';
      isValid = false;
    }

    if (!formData.billingAddress.trim()) {
      errors.billingAddress = 'Billing address is required.';
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
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        companyName: formData.companyName.trim(),
        billingAddress: formData.billingAddress.trim(),
        contactPerson: formData.contactPerson.trim() || `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        contactPhone: formData.contactPhone.trim() || formData.phoneNumber.trim(),
      };

      const res = await authService.updateClientProfile(payload);
      updateUser(res.user);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err: any) {
      if (Array.isArray(err.data?.error)) {
        setError(err.data.error.map((e: any) => e.message).join(', '));
      } else {
        setError(err.message || 'An error occurred during profile update. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-20 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[400px] gap-4">
        <LoaderRectangle />
        <span>Loading Account Profile...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-black font-jakarta pb-12 select-none">
      
      {/* Success / Error Banners */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md text-[10px] font-black uppercase tracking-wider leading-relaxed flex items-center gap-2 select-none animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Client profile successfully synchronized with database records!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-[10px] font-black uppercase tracking-wider leading-relaxed flex items-center gap-2 select-none animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSaveProfile} className="w-full bg-white border border-slate-200 rounded-lg p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
        
        {/* Header Block */}
        <div className="border-b border-slate-100 pb-5 select-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-black leading-none">Corporate Client Portal</span>
            <h2 className="text-sm font-black text-[#032031] tracking-tight leading-none mt-1.5">Company Profile & Account Details</h2>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#032031]/5 border border-[#032031]/10 rounded-sm">
            <Building2 className="w-3 h-3 text-[#032031]" />
            <span className="text-[8px] text-[#032031] font-black uppercase tracking-wider">
              Profile Status: {isProfileComplete ? 'Active Corporate' : 'Incomplete Profile'}
            </span>
          </div>
        </div>

        {/* Inputs Grid */}
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
              placeholder="e.g. John"
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
              placeholder="e.g. Smith"
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition"
            />
            {validationErrors.lastName && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.lastName}</span>
            )}
          </div>

          {/* Primary Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Primary Phone</label>
            <input 
              type="text" 
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

          {/* Company Name */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Company / Organization Name</label>
            <input 
              type="text" 
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Apex Security Estates Ltd"
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition"
            />
            {validationErrors.companyName && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.companyName}</span>
            )}
          </div>

          {/* Contact Person */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Designated Contact Person</label>
            <input 
              type="text" 
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. John Smith (Operations Director)"
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition"
            />
          </div>

          {/* Direct Line / Contact Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Direct Office / Site Phone</label>
            <input 
              type="text" 
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="e.g. +44 20 7946 0958"
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition"
            />
          </div>

          {/* Billing Address */}
          <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-3">
            <label className="text-[8px] font-black uppercase tracking-widest text-black pl-0.5">Corporate Billing Address</label>
            <textarea 
              name="billingAddress"
              required
              rows={2}
              value={formData.billingAddress}
              onChange={handleChange}
              placeholder="e.g. Suite 4B, Tower Bridge Business Complex, London, SE1 2UP"
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold bg-white focus:bg-white focus:outline-none focus:border-[#032031] text-black transition resize-none"
            />
            {validationErrors.billingAddress && (
              <span className="text-red-600 text-[8px] font-black pl-1 mt-0.5">{validationErrors.billingAddress}</span>
            )}
          </div>

        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-[#032031] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-md transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <LoaderRectangle />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Update Client Profile</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default ProfileSettings;
