'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '../../services/auth.service';
import { Shield, CheckCircle, AlertTriangle, ArrowRight, Mail } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const addToast = useUIStore((state) => state.addToast);
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Resend Verification states
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Guard against React StrictMode running useEffect twice in development
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const performVerification = async () => {
      if (!token) {
        setVerifying(false);
        setErrorMsg('Verification token is missing. Please check the link from your email.');
        return;
      }

      try {
        const response = await authService.verifyEmail({ token });
        setSuccess(true);
        addToast(response.message || 'Email verified successfully!', 'success');
      } catch (err: any) {
        setErrorMsg(err.message || 'Email verification failed. The link may have expired or is invalid.');
        setShowResend(true);
      } finally {
        setVerifying(false);
      }
    };

    performVerification();
  }, [token, addToast]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      addToast('Please enter your email address.', 'error');
      return;
    }
    setResendLoading(true);
    try {
      await authService.resendVerification({ email: resendEmail });
      addToast('Verification email resent successfully! Please check your inbox.', 'success');
      setShowResend(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to resend verification email.', 'error');
    } finally {
      setResendLoading(false);
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
            Account Activation.
          </h1>
          <p className="text-sm xl:text-base text-white/90 font-bold leading-relaxed">
            Verify your email credentials to establish a secure link and activate your Fortress ASR gateway access.
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

        {/* Center Content Card */}
        <div className="my-auto w-full max-w-md mx-auto py-8 sm:py-12 flex flex-col gap-8">
          
          {verifying ? (
            /* VERIFYING STATE */
            <div className="flex flex-col items-center text-center gap-6">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-t-2 border-[#032031]"></div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-[#032031]">Verifying Email...</h2>
                <p className="text-sm text-black font-bold uppercase tracking-wider">Establishing secure connection to database</p>
              </div>
            </div>
          ) : success ? (
            /* SUCCESS STATE */
            <div className="flex flex-col items-center text-center gap-6">
              <div className="bg-[#032031]/10 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-[#032031]" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-[#032031]">Verification Successful!</h2>
                <p className="text-sm text-black font-semibold">
                  Your email has been verified successfully. You can now access your secure portal.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full mt-4 bg-[#032031] hover:bg-black text-white py-4 px-6 rounded-full font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Proceed to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* FAILURE STATE */
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-red-50 p-4 rounded-full">
                  <AlertTriangle className="h-16 w-16 text-red-600" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-red-600">Verification Failed</h2>
                  <p className="text-sm text-black font-bold uppercase tracking-wider">Invalid or Expired Token</p>
                </div>
                <p className="text-xs text-black font-semibold mt-2">
                  {errorMsg}
                </p>
              </div>

              {showResend && (
                <div className="p-5 border-2 border-black rounded-2xl flex flex-col gap-4 bg-[#032031]/5 mt-4">
                  <div className="flex items-center gap-2 text-[#032031]">
                    <Mail className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider">Resend Verification Email</span>
                  </div>
                  <p className="text-xs font-bold text-black leading-relaxed">
                    Enter the email address registered with your account below to receive a new activation link.
                  </p>
                  <form onSubmit={handleResendVerification} className="flex flex-col gap-3">
                    <input
                      type="email"
                      required
                      placeholder="Your Registered Email"
                      className="w-full px-4 py-3 border border-black rounded-full text-xs font-bold placeholder-black bg-white hover:bg-slate-50 transition"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="w-full bg-[#032031] hover:bg-black text-white py-3 px-6 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
                    >
                      {resendLoading ? 'Sending link...' : 'Resend Verification Link'}
                    </button>
                  </form>
                </div>
              )}

              <div className="flex justify-center text-xs font-black mt-4">
                <Link href="/login" className="text-black hover:text-[#032031] hover:underline transition">
                  Back to Login
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Footer Row */}
        <div className="flex items-center justify-between pt-6 border-t border-black/10 text-[10px] text-black/50 font-black tracking-wider uppercase">
          <span>&copy; 2026 Fortress ASR</span>
          <span>Gateway Security Portal</span>
        </div>

      </div>

    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#032031] font-black">Loading Secure Gateway...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
