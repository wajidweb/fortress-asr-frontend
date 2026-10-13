'use client';

import React, { useState } from 'react';
import { adminService } from '@/services/admin.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Building,
  Sliders,
  PlusCircle,
} from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  // Form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Strict Super Admin Access Guard
  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="w-full min-h-[350px] bg-white border border-red-300 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
        <div className="p-3 bg-red-50 rounded-full text-red-600 border border-red-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-black uppercase tracking-tight">Access Restricted</h2>
        <p className="text-xs text-black/70 max-w-sm font-semibold">
          The Settings console is strictly reserved for the Super Administrator.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic client validations
    if (!oldPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password cannot be the same as current password.');
      return;
    }

    setLoading(true);

    try {
      const res = await adminService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setSuccess('Password changed successfully.');
        addToast('Password updated successfully.', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Incorrect current password. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Settings Grid: Small top-left Password Change card + expansion slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        
        {/* TOP-LEFT COMPACT CARD: Change Password */}
        <div className="bg-white border border-black rounded-xl p-5 shadow-xs flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/10">
            <div className="p-1.5 bg-[#032031] text-white rounded-lg">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-black">Change Password</h2>
              <p className="text-[10px] text-black/50 font-semibold">
                Update Super Admin account credentials
              </p>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-[11px] text-red-900 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-3 p-2 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-[11px] text-emerald-900 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Compact Form */}
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
            {/* Current Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-black">
                Current Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3 py-1.5 pr-8 border border-black rounded-lg text-xs font-semibold text-black placeholder-black/40 focus:outline-none focus:ring-1 focus:ring-[#032031] bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-2 p-1 text-black/40 hover:text-black transition cursor-pointer"
                  title={showOldPassword ? 'Hide' : 'Show'}
                >
                  {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-black">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full px-3 py-1.5 pr-8 border border-black rounded-lg text-xs font-semibold text-black placeholder-black/40 focus:outline-none focus:ring-1 focus:ring-[#032031] bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 p-1 text-black/40 hover:text-black transition cursor-pointer"
                  title={showNewPassword ? 'Hide' : 'Show'}
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-black">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Re-type new password"
                  required
                  className="w-full px-3 py-1.5 pr-8 border border-black rounded-lg text-xs font-semibold text-black placeholder-black/40 focus:outline-none focus:ring-1 focus:ring-[#032031] bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 p-1 text-black/40 hover:text-black transition cursor-pointer"
                  title={showConfirmPassword ? 'Hide' : 'Show'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !oldPassword || !newPassword || !confirmPassword}
              className="mt-2 w-full py-2 bg-[#032031] text-white rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-black transition shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* FUTURE EXPANSION SLOT 1: Company Profile (Placeholder) */}
        <div className="border border-dashed border-black/20 rounded-xl p-5 flex flex-col justify-between min-h-[260px] bg-black/[0.01]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-black/5 text-black/40 rounded-lg">
                <Building className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase bg-black/5 text-black/40">
                Coming Soon
              </span>
            </div>
            <h3 className="text-xs font-black text-black/50 mt-1">
              Company & Organization Profile
            </h3>
            <p className="text-[10px] text-black/40 font-medium leading-relaxed">
              Configure company branding, official registered address, operational headquarters, and corporate logos.
            </p>
          </div>
          <div className="pt-3 border-t border-black/10 flex items-center gap-1.5 text-[10px] font-bold text-black/30">
            <PlusCircle className="w-3 h-3" />
            <span>Reserved for future expansion</span>
          </div>
        </div>

        {/* FUTURE EXPANSION SLOT 2: System & Notifications Preferences (Placeholder) */}
        <div className="border border-dashed border-black/20 rounded-xl p-5 flex flex-col justify-between min-h-[260px] bg-black/[0.01]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-black/5 text-black/40 rounded-lg">
                <Sliders className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase bg-black/5 text-black/40">
                Coming Soon
              </span>
            </div>
            <h3 className="text-xs font-black text-black/50 mt-1">
              System & Operational Policies
            </h3>
            <p className="text-[10px] text-black/40 font-medium leading-relaxed">
              Configure default patrol geofence margins, shift handover timeout windows, and system alert routing.
            </p>
          </div>
          <div className="pt-3 border-t border-black/10 flex items-center gap-1.5 text-[10px] font-bold text-black/30">
            <PlusCircle className="w-3 h-3" />
            <span>Reserved for future expansion</span>
          </div>
        </div>

      </div>
    </div>
  );
}
