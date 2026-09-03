'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '../../services/auth.service';
import { Mail, Shield } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const addToast = useUIStore((state) => state.addToast);
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setValidationError('Email address is required.');
      return false;
    } else if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
      const msg = response.message || 'If the email exists, a password reset link has been sent.';
      addToast(msg, 'success');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to request password reset';
      addToast(errMsg, 'error');
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
            src="/operations1.jpeg"
            alt="Security Operations Center"
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
            Recover Your Secure Credentials.
          </h1>
          <p className="text-sm xl:text-base text-white/90 font-bold leading-relaxed">
            Regain access to your officer dispatching console, live scheduler, and automated operations portals.
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

        {/* Center Forgot Password Form Container */}
        <div className="my-auto w-full max-w-md mx-auto py-8 sm:py-12">
          <div className="flex flex-col gap-1.5 mb-8">
            <h2 className="text-3xl xl:text-4xl font-black text-[#032031] tracking-tight">Recover Credentials</h2>
            <p className="text-xs text-black font-black uppercase tracking-wider">Forgot your password? We will send you reset instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Email Field with validation */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className={`w-full pl-5 pr-12 py-3.5 border ${validationError ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black" />
              </div>
              {validationError && (
                <span className="text-red-600 text-[11px] font-black pl-4">{validationError}</span>
              )}
            </div>

            {/* Elegant Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-[#032031] hover:bg-black text-white py-4 px-6 rounded-full font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-75"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending reset link...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Send Reset Link</span>
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
