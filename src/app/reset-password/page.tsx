'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '../../services/auth.service';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const addToast = useUIStore((state) => state.addToast);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      addToast('Invalid, expired or missing reset token.', 'error');
    }
  }, [token, addToast]);

  const validateForm = (): boolean => {
    const errors: { password?: string; confirm?: string } = {};
    let isValid = true;

    if (!newPassword) {
      errors.password = 'New password is required.';
      isValid = false;
    } else if (newPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match.';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!token) {
      addToast('Invalid, expired or missing reset token.', 'error');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({ token, newPassword });
      addToast(response.message || 'Password reset successful!', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      addToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#032031] overflow-y-auto lg:overflow-hidden font-sans antialiased text-black">
      
      {/* LEFT COLUMN: Deep dark brand panel with operations background image and dark overlay */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 relative overflow-hidden shrink-0">
        
        {/* Full background operations image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/operations3.jpeg"
            alt="Security Officer on Patrol"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center scale-105 filter saturate-[0.8]"
            priority
          />
          {/* Deep #032031 overlay to create high-contrast container */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#032031]/95 via-[#032031]/90 to-[#02141F]/95 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#032031]/30 mix-blend-overlay" />
        </div>

        {/* Top Tagline */}
        <div className="z-10 flex items-center gap-2">
          <Shield className="w-5 h-5 text-white" />
          <span className="text-xs text-white font-black tracking-wider uppercase">
            Security Operations Command Center
          </span>
        </div>

        {/* Center Marketing & Role-Specific Content */}
        <div className="my-auto z-10 flex flex-col gap-4 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Secure Credentials Update.
          </h1>
          <p className="text-sm xl:text-base text-white/90 font-bold leading-relaxed">
            Ensure your operational security protocols are maintained with high entropy, secure passwords.
          </p>
        </div>

        {/* Sidebar Footer */}
        <div className="z-10 text-[10px] text-white/50 font-black tracking-wider uppercase">
          Fortress ASR Security Operations Management System.
        </div>
      </div>

      {/* RIGHT COLUMN: White container */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 xl:p-16 relative lg:rounded-l-[42px] xl:rounded-l-[56px] shadow-2xl z-20 overflow-y-auto">
        
        {/* Top Header Row within Form Card */}
        <div className="flex items-center justify-between w-full">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 select-none">
            <div className="relative w-8 h-8">
              <Image 
                src="/logo.png" 
                alt="Fortress ASR" 
                fill 
                sizes="32px"
                className="object-contain rounded"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[#032031] text-sm font-black tracking-wider uppercase leading-none">
                Fortress ASR
              </span>
              <span className="text-[8px] text-black font-extrabold uppercase tracking-widest mt-0.5">
                Security Systems
              </span>
            </div>
          </Link>
        </div>

        {/* Center Reset Password Form Container */}
        <div className="my-auto w-full max-w-md mx-auto py-8 sm:py-12">
          <div className="flex flex-col gap-1.5 mb-8">
            <h2 className="text-3xl xl:text-4xl font-black text-[#032031] tracking-tight">Reset Password</h2>
            <p className="text-xs text-black font-black uppercase tracking-wider">Configure your new secure account password</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* New Password Field with validation */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="New Password"
                  disabled={!token}
                  className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.password ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: undefined }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 focus:outline-none text-black hover:text-[#032031] transition"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {validationErrors.password && (
                <span className="text-red-600 text-[11px] font-black pl-4">{validationErrors.password}</span>
              )}
            </div>

            {/* Confirm Password Field with validation */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm Password"
                  disabled={!token}
                  className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.confirm ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirm) setValidationErrors(prev => ({ ...prev, confirm: undefined }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 focus:outline-none text-black hover:text-[#032031] transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {validationErrors.confirm && (
                <span className="text-red-600 text-[11px] font-black pl-4">{validationErrors.confirm}</span>
              )}
            </div>

            {/* Elegant Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full mt-3 bg-[#032031] hover:bg-black text-white py-4 px-6 rounded-full font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-75"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Resetting password...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Reset Password</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Back To Login Trigger */}
        <div className="flex items-center justify-center pt-6 border-t border-black/10">
          <Link
            href="/login"
            className="text-xs font-black uppercase tracking-wider text-[#032031] hover:underline"
          >
            Back to Login Portal
          </Link>
        </div>

      </div>

    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#032031] font-black">Loading secure credential gateways...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
