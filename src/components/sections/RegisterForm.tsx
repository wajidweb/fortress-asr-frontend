'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Apple, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [siaNumber, setSiaNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation State Object tracking granular error strings (No dashes)
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    siaNumber?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // 01. Full Name Validation: Must have first and last names
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    } else if (trimmedName.split(/\s+/).length < 2) {
      newErrors.name = 'Please enter both your first and last name';
    }

    // 02. Email Address Validation: Standard regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 03. Phone Number Validation: Stripping spaces/brackets, must be 10 to 14 digits
    const strippedPhone = phone.replace(/[\s()]/g, '');
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(strippedPhone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // 04. SIA Licence Number Validation: Must be exactly 16 digits (Page 10 of BRD/SRS)
    const strippedSia = siaNumber.replace(/\s/g, '');
    const siaRegex = /^\d{16}$/;
    if (!siaNumber) {
      newErrors.siaNumber = 'SIA licence number is required';
    } else if (!siaRegex.test(strippedSia)) {
      newErrors.siaNumber = 'SIA licence must be exactly 16 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    
    // Trigger dynamic frontend validation checks
    const isValid = validateForm();
    if (!isValid) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    // Responsive, high-fidelity split-screen container card wrapped inside the website's Tailwind margins
    <div className="w-full bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
      
      {/* LEFT COLUMN: Clean White Form Pane (Occupies 6/12 cols on desktop - 50%) */}
      <div className="col-span-12 lg:col-span-6 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Form Headers */}
          <div className="text-center sm:text-left space-y-2">
            <h2 className="text-2xl font-black text-[#032031] tracking-tight uppercase">
              Guard Onboarding Request
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Enter your compliance and licensing details
            </p>
          </div>

          {success ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center space-y-4 text-center animate-fade-in shadow-sm">
              <div className="p-3 bg-emerald-500 text-white rounded-full">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-emerald-900 uppercase">Request Submitted</h3>
              <p className="text-[11px] text-emerald-700 leading-relaxed font-semibold">
                Your onboarding request has been queued. Our compliance team will verify your SIA credentials and Right to Work status. We will contact you within twenty four hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
              
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-700">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }} 
                  placeholder="Enter your name" 
                  className={`w-full px-4 py-2.5 bg-[#f8fafc] border rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#032031] focus:bg-white transition-all ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.name && (
                  <p className="text-[10px] text-red-500 font-bold uppercase mt-1 pl-1 leading-none">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }} 
                  placeholder="Enter your email" 
                  className={`w-full px-4 py-2.5 bg-[#f8fafc] border rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#032031] focus:bg-white transition-all ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-bold uppercase mt-1 pl-1 leading-none">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-700">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }} 
                  placeholder="Enter your phone number" 
                  className={`w-full px-4 py-2.5 bg-[#f8fafc] border rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#032031] focus:bg-white transition-all ${
                    errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[10px] text-red-500 font-bold uppercase mt-1 pl-1 leading-none">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* SIA Licence Number */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-700">SIA Licence Number</label>
                <input 
                  type="text" 
                  required 
                  value={siaNumber} 
                  onChange={(e) => {
                    setSiaNumber(e.target.value);
                    if (errors.siaNumber) setErrors(prev => ({ ...prev, siaNumber: undefined }));
                  }} 
                  placeholder="E.g. 9048 2234 1192 1095" 
                  className={`w-full px-4 py-2.5 bg-[#f8fafc] border rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#032031] focus:bg-white transition-all ${
                    errors.siaNumber ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.siaNumber && (
                  <p className="text-[10px] text-red-500 font-bold uppercase mt-1 pl-1 leading-none">
                    {errors.siaNumber}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-1">
                <input 
                  type="checkbox" 
                  id="terms" 
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-3.5 h-3.5 border-slate-300 rounded text-[#032031] focus:ring-[#032031]"
                />
                <label htmlFor="terms" className="text-[10px] text-slate-500 font-semibold leading-relaxed cursor-pointer select-none">
                  I authorize Fortress ASR to verify my active SIA licence and work credentials.
                </label>
              </div>

              {/* Submit Onboarding Request Button */}
              <button 
                type="submit" 
                disabled={submitting || !termsAccepted}
                className="w-full py-3 mt-1 bg-[#032031] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md focus:outline-none"
              >
                {submitting ? 'Verifying Credentials...' : 'Submit Onboarding Request'}
              </button>

              {/* Secure Notice Footer */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                  Our compliance team will review and audit your credentials within twenty four hours.
                </p>
              </div>

            </form>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: Premium Dark-Teal Graphic Pane (Occupies 6/12 cols on desktop - 50%) */}
      <div className="hidden lg:flex lg:col-span-6 bg-[#032031] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Micro dots background mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none z-0"></div>
        
        {/* Concentric subtle circular glow */}
        <div className="absolute right-[-10%] top-[-10%] w-[350px] h-[350px] bg-slate-50/5 rounded-full filter blur-3xl opacity-60 z-0"></div>

        <div className="relative z-10 flex flex-col justify-between h-full max-w-lg mx-auto py-6">
          
          {/* Header Copy mirroring image.png exactly */}
          <div className="space-y-3 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight leading-[1.08]">
              Welcome To Fortress ASR!<br />
              Join Our Elite Operations Team
            </h2>
            <div className="w-12 h-0.5 bg-white mx-auto rounded"></div>
            <p className="text-white/80 text-[11px] font-semibold leading-relaxed max-w-md mx-auto">
              We coordinate our complete physical security operations, on site patrols, and daily incident responses through one centralized system of record.
            </p>
          </div>

          {/* High Fidelity CSS Security Dashboard Mockup matching reference image charts exactly */}
          <div className="relative w-full max-w-sm mx-auto aspect-[16/11] bg-white rounded-2xl shadow-2xl border border-white/10 p-5 flex flex-col justify-between mt-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider">Patrol Compliance Report</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
                <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#032031]"></span> Total
                </span>
              </div>
            </div>

            {/* Simulated Bar Chart */}
            <div className="flex-grow flex items-end justify-between gap-3 pt-4 pb-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-[#032031]/10 rounded-t h-12 relative">
                  <div className="absolute bottom-0 inset-x-0 bg-[#032031] h-8 rounded-t"></div>
                </div>
                <span className="text-[7px] text-slate-400 font-black uppercase">Jan</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-[#032031]/10 rounded-t h-20 relative">
                  <div className="absolute bottom-0 inset-x-0 bg-[#032031] h-12 rounded-t"></div>
                </div>
                <span className="text-[7px] text-slate-400 font-black uppercase">Feb</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-[#032031]/10 rounded-t h-24 relative">
                  <div className="absolute bottom-0 inset-x-0 bg-[#cba135] h-16 rounded-t"></div>
                </div>
                <span className="text-[7px] text-slate-400 font-black uppercase">Mar</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-[#032031]/10 rounded-t h-16 relative">
                  <div className="absolute bottom-0 inset-x-0 bg-[#032031] h-10 rounded-t"></div>
                </div>
                <span className="text-[7px] text-slate-400 font-black uppercase">Apr</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-[#032031]/10 rounded-t h-28 relative">
                  <div className="absolute bottom-0 inset-x-0 bg-[#032031] h-20 rounded-t"></div>
                </div>
                <span className="text-[7px] text-slate-400 font-black uppercase">May</span>
              </div>
            </div>

            {/* Overlapping Floating Donut Chart Card representing Active Officer Categories */}
            <div className="absolute right-[-4%] bottom-[12%] w-[42%] aspect-[9/10] bg-white border border-slate-100 rounded-xl shadow-2xl p-3 flex flex-col justify-between text-left transform rotate-[-2deg] transition-all hover:rotate-[0deg] hover:scale-105 duration-300">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Officer Status</span>
              {/* Clean simulated CSS donut chart ring */}
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center my-1.5">
                <div className="absolute inset-0 rounded-full border-[4px] border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-[4px] border-[#032031] border-t-transparent border-l-transparent transform rotate-45"></div>
                <div className="absolute inset-0 rounded-full border-[4px] border-[#cba135] border-b-transparent border-r-transparent transform -rotate-45"></div>
                <span className="text-[7px] font-black text-slate-800 leading-none">99.8%</span>
              </div>
              <div className="flex justify-between items-center text-[7px] font-black text-slate-400 uppercase leading-none">
                <span>Active</span>
                <span>Off-duty</span>
              </div>
            </div>

          </div>

          {/* Indicators bullet points */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-6 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default RegisterForm;
