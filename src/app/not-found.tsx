'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/ui/Loader';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
      {/* 00. Dynamic Header Navigation */}
      <Navbar />

      {/* Main 404 Content Card wrapped inside standard Tailwind container margins */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex items-center justify-center animate-fade-in">
        
        {/* Thematic, high-fidelity security-themed card */}
        <div className="w-full bg-[#032031] text-white rounded-[32px] shadow-2xl border border-white/5 overflow-hidden relative p-8 sm:p-16 max-w-2xl text-center space-y-8 flex flex-col items-center justify-center min-h-[460px]">
          
          {/* Micro dots background mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none z-0"></div>
          
          {/* Concentric subtle circular glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full filter blur-3xl opacity-60 z-0"></div>

          <div className="relative z-10 space-y-6 max-w-lg mx-auto">
            {/* Animated Shield Warning Indicator Badge */}
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-12 w-12 rounded-full bg-red-500/10 animate-ping"></span>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl shadow-sm text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Error Indicators (Zero dashes!) */}
            <div className="space-y-2">
              <span className="text-red-400 font-black text-xs uppercase tracking-widest leading-none block">
                Error Four Zero Four
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-none">
                Unsecured Sector
              </h1>
            </div>

            {/* Sourced Copywrite Content (SOMS theme, completely dash-free!) */}
            <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed max-w-md mx-auto">
              The sector coordinates or page files you are attempting to access do not exist or are restricted. Please return to a secured site perimeter immediately.
            </p>

            {/* Action pill button returning to Home */}
            <div className="pt-2 flex justify-center">
              <Link
                href="/"
                className="inline-flex justify-center items-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-100 text-[#032031] font-bold text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return To Secured Site
              </Link>
            </div>
          </div>

          {/* Symmetrical Mini Status Line at bottom */}
          <div className="relative z-10 w-full pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-white/50 text-[9px] font-black uppercase tracking-wider">
            <span>SOMS SECURITY JOURNAL BOOK</span>
            <span className="text-slate-500">•</span>
            <span>PROTECTED BY FORTRESS ASR</span>
          </div>

        </div>

      </div>

      {/* 10. Dynamic Footer */}
      <Footer />

      {/* 11. Miniature Floating Scroll-To-Top Button (Fixed Bottom-Right) */}
      <ScrollToTop />
    </div>
  );
}
