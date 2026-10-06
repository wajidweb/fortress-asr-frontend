'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export default function ClientRegisterPage() {
  const router = useRouter();
  const addToast = useUIStore((state) => state.addToast);
  
  // Form fields: Only Email, Password, and Confirm Password
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State to track successful registration
  const [isRegistered, setIsRegistered] = useState(false);

  // Validation and API states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side validations
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await authService.registerClient({
        email: formData.email,
        password: formData.password,
      });
      setIsRegistered(true);
    } catch (err: any) {
      let errMsg = '';
      if (Array.isArray(err.data?.error)) {
        errMsg = err.data.error.map((e: any) => e.message).join(', ');
      } else {
        errMsg = err.message || 'Registration failed. This email may already be in use.';
      }
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
          {/* Deep #032031 solid overlay with blend multiply to create a dark, professional, secure command center appearance */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#032031]/95 via-[#032031]/90 to-[#02141F]/95 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#032031]/30 mix-blend-overlay" />
        </div>

        {/* Top Tagline */}
        <div className="z-10 flex items-center gap-2">
          <Shield className="w-5 h-5 text-white" />
          <span className="text-xs text-white font-black tracking-wider uppercase">
            Create a Corporate Client Account
          </span>
        </div>

        {/* Center Marketing Copy (Tailored for Clients) */}
        <div className="my-auto z-10 flex flex-col gap-4 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Deploy & Monitor Your Security Assets.
          </h1>
          <p className="text-sm xl:text-base text-white/90 font-bold leading-relaxed">
            Monitor guard positions, inspect live digital occurrence books, and download verified proof of service logs at your convenience.
          </p>
        </div>

        {/* Sidebar Copyright Info */}
        <div className="z-10 text-[10px] text-white/50 font-black tracking-wider uppercase">
          Fortress ASR Security Operations Management System.
        </div>
      </div>

      {/* RIGHT COLUMN: Fully responsive White, Black & #032031 form container (Strictly NO Grays) */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 xl:p-16 relative lg:rounded-l-[42px] xl:rounded-l-[56px] shadow-2xl z-20 overflow-y-auto">
        
        {/* Top Header Row within Form Card - Fully Responsive across small devices */}
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

          {/* Registration Redirect Trigger */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-xs text-black font-black">Registered?</span>
            <Link 
              href="/login"
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-black text-[#032031] border border-black rounded-full hover:bg-[#032031] hover:text-white transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {isRegistered ? (
          /* SINGLE BEAUTIFUL SUCCESS VIEW WITHOUT MULTIPLE TOASTS */
          <div className="my-auto w-full max-w-md mx-auto py-8 sm:py-12 flex flex-col items-center text-center gap-6">
            <div className="bg-[#032031]/10 p-4 rounded-full">
              <Mail className="h-16 w-16 text-[#032031]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl xl:text-3xl font-black text-[#032031] tracking-tight">Please Check Your Email</h2>
              <p className="text-xs text-black font-black uppercase tracking-wider">A verification link has been sent to you</p>
            </div>
            <p className="text-sm text-black font-semibold leading-relaxed max-w-sm">
              We have dispatched a secure activation link to your email address. Please click the verification button inside that email to activate your account.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full mt-4 bg-[#032031] hover:bg-black text-white py-4 px-6 rounded-full font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Verify</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Center Register Form Container */
          <div className="my-auto w-full max-w-md mx-auto py-8 sm:py-12 font-sans">
            <div className="flex flex-col gap-1.5 mb-8">
              <h2 className="text-3xl xl:text-4xl font-black text-[#032031] tracking-tight">Client Register</h2>
              <p className="text-xs text-black font-black uppercase tracking-wider">Create your corporate site manager portal</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Email Field with validation */}
              <div className="flex flex-col gap-1.5">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email Address"
                    className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.email ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    required
                    placeholder="Password (Min 8 characters)"
                    className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.password ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                    value={formData.password}
                    onChange={handleChange}
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
                    name="confirmPassword"
                    required
                    placeholder="Confirm Password"
                    className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.confirmPassword ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 focus:outline-none text-black hover:text-[#032031] transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <span className="text-red-600 text-[11px] font-black pl-4">{validationErrors.confirmPassword}</span>
                )}
              </div>

              {/* Register Submit Button with spinner loader */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#032031] hover:bg-black text-white py-4 px-6 rounded-full font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-75"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Onboarding...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span>Register</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Empty layout cushion */}
        <div className="hidden lg:block h-2" />

      </div>

    </div>
  );
}
