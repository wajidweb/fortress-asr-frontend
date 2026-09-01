'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const { user, isAuthenticated, login } = useAuthStore();
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation and API states
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // Auto redirect already authenticated users to their dashboards
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'CLIENT') {
        router.push('/client/dashboard');
      } else if (user.role === 'GUARD') {
        router.push('/guard/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // Client-side validations
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    // Password length check
    if (!password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { accessToken, user: loggedInUser } = await authService.login({ email, password });
      login(loggedInUser, accessToken);
      
      if (loggedInUser.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (loggedInUser.role === 'CLIENT') {
        router.push('/client/dashboard');
      } else if (loggedInUser.role === 'GUARD') {
        router.push('/guard/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent showing login form while redirecting authenticated users
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[#032031] font-black text-sm uppercase tracking-wider">
        Redirecting to secure gateway...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#032031] overflow-y-auto lg:overflow-hidden font-sans antialiased text-black">
      
      {/* LEFT COLUMN: Deep dark brand panel with operations background image and dark overlay */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 relative overflow-hidden shrink-0">
        
        {/* Full background operations image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/operations2.jpeg"
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
            Command & Control Your Security Workforce.
          </h1>
          <p className="text-sm xl:text-base text-white/90 font-bold leading-relaxed">
            Real time officer dispatching, live GPS patrol tracking, and automated proof of service reporting.
          </p>
        </div>

        {/* Sidebar Footer */}
        <div className="z-10 text-[10px] text-white/50 font-black tracking-wider uppercase">
          Fortress ASR Security Operations Management System.
        </div>
      </div>

      {/* RIGHT COLUMN: Fully responsive White, Black & #032031 form container (Strictly NO Grays) */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 xl:p-16 relative lg:rounded-l-[42px] xl:rounded-l-[56px] shadow-2xl z-20 overflow-y-auto">
        
        {/* Top Header Row within Form Card - Fully Responsive across small and extra-small devices */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
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
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[#032031] text-sm font-black tracking-wider uppercase leading-none">
                Fortress ASR
              </span>
              <span className="text-[8px] text-black font-extrabold uppercase tracking-widest mt-0.5">
                Security Systems
              </span>
            </div>
          </Link>

          {/* Registration Selection Trigger */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-xs text-black font-black">New here?</span>
            <div className="relative group pb-2">
              <button className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-black text-[#032031] border border-black rounded-full hover:bg-[#032031] hover:text-white transition duration-200">
                Sign Up
              </button>
              {/* Dropdown with padding wrapper to bridge the hover gap */}
              <div className="absolute right-1/2 translate-x-1/2 sm:right-0 sm:translate-x-0 top-full pt-1 w-44 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-200 z-50">
                <div className="bg-white border border-black rounded-xl shadow-xl p-1">
                  <button
                    onClick={() => router.push('/register/client')}
                    className="w-full text-left px-3 py-2 text-xs font-black text-black hover:bg-slate-100 rounded-lg transition"
                  >
                    As Client
                  </button>
                  <button
                    onClick={() => router.push('/register/guard')}
                    className="w-full text-left px-3 py-2 text-xs font-black text-black hover:bg-slate-100 rounded-lg transition"
                  >
                    As Security Guard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Login Form Container */}
        <div className="my-auto w-full max-w-md mx-auto py-8 sm:py-12">
          <div className="flex flex-col gap-1.5 mb-8">
            <h2 className="text-3xl xl:text-4xl font-black text-[#032031] tracking-tight">Login</h2>
            <p className="text-xs text-black font-black uppercase tracking-wider">Access your Fortress ASR secure portal</p>
          </div>

          {/* Registration Success Toaster Banner (Strictly White, Black & #032031) */}
          {registered === 'true' && (
            <div className="bg-[#032031] text-white border border-black p-4 rounded-xl mb-6 text-xs font-black leading-relaxed flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Account created successfully! You can now log in below.</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-black text-[#032031] p-4 rounded-xl mb-6 text-xs font-black leading-relaxed flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#032031] shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Email Field with validation */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.email ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: undefined }));
                  }}
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black" />
              </div>
              {validationErrors.email && (
                <span className="text-red-600 text-[11px] font-black pl-4">{validationErrors.email}</span>
              )}
            </div>

            {/* Password Field with validation */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.password ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
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

            {/* Forgot Password Trigger */}
            <div className="flex justify-start text-xs font-black">
              <button
                type="button"
                className="text-black hover:text-[#032031] hover:underline transition duration-200"
                onClick={() => router.push('/forgot-password')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Elegant Submit Button relying solely on White, Black and #032031 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-[#032031] hover:bg-black text-white py-4 px-6 rounded-full font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-75"
            >
              {loading ? (
                // Beautiful fluid CSS rotating loading spinner matching the brand palette
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Login</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Registration Links (Strictly White, Black & #032031) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/10">
          <Link
            href="/register/guard"
            className="w-full sm:w-auto text-center px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#032031] border border-black rounded-full hover:bg-black hover:text-white transition duration-200"
          >
            Guard Registration
          </Link>
          <Link
            href="/register/client"
            className="w-full sm:w-auto text-center px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#032031] border border-black rounded-full hover:bg-black hover:text-white transition duration-200"
          >
            Client Registration
          </Link>
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#032031] font-black">Loading Secure Gateway...</div>}>
      <LoginForm />
    </Suspense>
  );
}
