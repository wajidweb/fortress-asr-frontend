'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Mail, Eye, EyeOff, ArrowRight, Shield, User, Phone } from 'lucide-react';

export default function GuardRegisterPage() {
  const router = useRouter();
  
  // Form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation and API states
  const [error, setError] = useState('');
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

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required.';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required.';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required.';
      isValid = false;
    } else if (formData.phoneNumber.length < 5) {
      errors.phoneNumber = 'Please enter a valid phone number.';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 8) {
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
      await authService.registerGuard(formData);
      router.push('/login?registered=true');
    } catch (err: any) {
      if (Array.isArray(err.data?.error)) {
        setError(err.data.error.map((e: any) => e.message).join(', '));
      } else {
        setError(err.message || 'Registration failed. This email may already be in use.');
      }
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
            alt="Security Forces Guard Duty"
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
            Onboard as an Elite Officer
          </span>
        </div>

        {/* Center Marketing Copy (Tailored for Guards) */}
        <div className="my-auto z-10 flex flex-col gap-4 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Join the Fortress Team of Officers.
          </h1>
          <p className="text-sm xl:text-base text-white/90 font-bold leading-relaxed">
            SIA compliant rosters, GPS check in evidence, live NFC tag patrols, and instant incident logging tools at your command.
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

        {/* Center Register Form Container */}
        <div className="my-auto w-full max-w-md mx-auto py-8 sm:py-12">
          <div className="flex flex-col gap-1.5 mb-8">
            <h2 className="text-3xl xl:text-4xl font-black text-[#032031] tracking-tight">Guard Register</h2>
            <p className="text-xs text-black font-black uppercase tracking-wider">Onboard into the patrol monitoring platform</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-black text-[#032031] p-4 rounded-xl mb-6 text-xs font-black leading-relaxed flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#032031] shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Row: First and Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="First Name"
                    className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.firstName ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black" />
                </div>
                {validationErrors.firstName && (
                  <span className="text-red-600 text-[11px] font-black pl-4">{validationErrors.firstName}</span>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Last Name"
                    className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.lastName ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black" />
                </div>
                {validationErrors.lastName && (
                  <span className="text-red-600 text-[11px] font-black pl-4">{validationErrors.lastName}</span>
                )}
              </div>
            </div>

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

            {/* Phone Number Field */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  placeholder="Phone Number"
                  className={`w-full pl-5 pr-12 py-3.5 border ${validationErrors.phoneNumber ? 'border-red-600' : 'border-black'} rounded-full text-sm font-bold placeholder-black bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#032031]/10 focus:border-[#032031] transition-all duration-200 text-black`}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black" />
              </div>
              {validationErrors.phoneNumber && (
                <span className="text-red-600 text-[11px] font-black pl-4">{validationErrors.phoneNumber}</span>
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

        {/* Empty layout cushion */}
        <div className="hidden lg:block h-2" />

      </div>

    </div>
  );
}
