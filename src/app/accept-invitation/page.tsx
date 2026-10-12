'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Eye, EyeOff, Shield, CheckCircle2, AlertCircle, ArrowRight, UserCheck, Lock } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const addToast = useUIStore((state) => state.addToast);

  const [invitationData, setInvitationData] = useState<{
    valid: boolean;
    email: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    department?: string | null;
    template: string;
  } | null>(null);

  const [verifying, setVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenError('Invitation token is missing. Please check the link in your onboarding email.');
      return;
    }

    const verify = async () => {
      try {
        setVerifying(true);
        const res = await authService.verifyInvitation(token);
        setInvitationData(res);
      } catch (err: any) {
        setTokenError(err?.message || 'This invitation link is invalid, expired, or has already been used.');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  const validateForm = (): boolean => {
    const errors: { password?: string; confirm?: string } = {};
    let isValid = true;

    if (!password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
      isValid = false;
    }

    if (password !== confirmPassword) {
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
      addToast('Missing invitation token.', 'error');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await authService.acceptInvitation({ token, password });
      addToast(response.message || 'Account activated successfully!', 'success');
      setIsSuccess(true);
    } catch (err: any) {
      addToast(err?.message || 'Failed to activate account. The invitation link may have expired.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#032031] overflow-y-auto lg:overflow-hidden font-sans antialiased text-black">
      {/* LEFT COLUMN: Brand operations hero panel matching Login page */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 relative overflow-hidden shrink-0">
        {/* Full background operations image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/operations1.jpeg"
            alt="Security Operations Command Center"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center scale-105 filter saturate-[0.8]"
            priority
          />
          {/* Deep #032031 overlay */}
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

        {/* Center Welcome Content */}
        <div className="my-auto z-10 flex flex-col gap-4 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Join The Command Room Workforce.
          </h1>
          <p className="text-sm xl:text-base text-white/90 font-bold leading-relaxed">
            Establish your credentials to activate access to the Fortress ASR Security Operations management system.
          </p>
        </div>

        {/* Sidebar Footer */}
        <div className="z-10 text-[10px] text-white/50 font-black tracking-wider uppercase">
          Fortress ASR Security Operations Management System.
        </div>
      </div>

      {/* RIGHT COLUMN: Responsive Form Container matching Login page layout */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 xl:p-16 relative lg:rounded-l-[42px] xl:rounded-l-[56px] shadow-2xl z-20 overflow-y-auto">
        {/* Top Header Row within Form Card */}
        <div className="flex items-center justify-between gap-4 w-full">
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
            <div className="flex flex-col items-start">
              <span className="text-[#032031] text-sm font-black tracking-wider uppercase leading-none">
                Fortress ASR
              </span>
              <span className="text-[8px] text-black font-extrabold uppercase tracking-widest mt-0.5">
                Security Systems
              </span>
            </div>
          </Link>

          {/* Quick Sign In Navigation */}
          <Link
            href="/login"
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-black text-[#032031] border border-black rounded-full hover:bg-[#032031] hover:text-white transition duration-200"
          >
            Sign In
          </Link>
        </div>

        {/* Center Container */}
        <div className="my-auto w-full max-w-md mx-auto py-8 sm:py-12">
          {verifying ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <LoaderRectangle />
              <p className="text-xs font-black uppercase tracking-wider text-black/60">
                Verifying security invitation token...
              </p>
            </div>
          ) : tokenError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center text-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-black text-black">Invitation Invalid or Expired</h3>
                <p className="text-xs text-black/70 leading-relaxed font-semibold">
                  {tokenError}
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 w-full py-3 bg-[#032031] text-white text-xs font-black uppercase tracking-wider rounded-full hover:bg-black transition text-center shadow-xs"
              >
                Return to Login
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black text-black">Account Activated!</h3>
                <p className="text-xs text-black/70 leading-relaxed font-semibold">
                  Your credentials have been securely registered. You can now log in to the Fortress ASR command operations center.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-2 w-full py-3 bg-[#032031] text-white text-xs font-black uppercase tracking-wider rounded-full hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                Proceed to Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Form Title & Onboarding Greeting */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authorized Staff Onboarding</span>
                </div>
                <h2 className="text-3xl xl:text-4xl font-black text-[#032031] tracking-tight">
                  Activate Account
                </h2>
                <p className="text-xs text-black/70 font-semibold leading-relaxed">
                  Welcome, <strong className="text-[#032031]">{invitationData?.firstName} {invitationData?.lastName}</strong>! Set up a secure password to activate your command center access.
                </p>
              </div>

              {/* Employee Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-black/15 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-black/50">Email</span>
                  <span className="font-bold text-black">{invitationData?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-black/50">Appointment</span>
                  <span className="font-black text-[#032031]">{invitationData?.jobTitle}</span>
                </div>
                {invitationData?.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-black/50">Department</span>
                    <span className="font-semibold text-black">{invitationData.department}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-black/50">Access Tier</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase border border-slate-300 bg-white text-black">
                    {invitationData?.template.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Activation Password Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* New Password Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="New Password (min 8 characters)"
                      className={`w-full pl-5 pr-12 py-3.5 border ${
                        validationErrors.password ? 'border-red-600' : 'border-black'
                      } rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (validationErrors.password) {
                          setValidationErrors((prev) => ({ ...prev, password: undefined }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <span className="text-[10px] text-red-600 font-bold pl-3">
                      {validationErrors.password}
                    </span>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm New Password"
                      className={`w-full pl-5 pr-12 py-3.5 border ${
                        validationErrors.confirm ? 'border-red-600' : 'border-black'
                      } rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (validationErrors.confirm) {
                          setValidationErrors((prev) => ({ ...prev, confirm: undefined }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.confirm && (
                    <span className="text-[10px] text-red-600 font-bold pl-3">
                      {validationErrors.confirm}
                    </span>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#032031] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full hover:bg-black transition duration-200 shadow-md cursor-pointer disabled:opacity-50 mt-1"
                >
                  {submitting ? 'Activating Account...' : 'Activate Account & Set Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#032031] flex items-center justify-center text-xs font-black uppercase tracking-wider text-white">
          <LoaderRectangle />
        </div>
      }
    >
      <AcceptInvitationForm />
    </Suspense>
  );
}
