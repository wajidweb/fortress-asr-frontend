'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/ui/Loader';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { Lock, Clock, ShieldCheck } from 'lucide-react';

export default function ComingSoonPage() {
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

      {/* Main Coming Soon Content Card wrapped inside standard Tailwind container margins */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex items-center justify-center animate-fade-in">
        
        {/* Balanced, beautiful double row container */}
        <div className="w-full bg-[#032031] text-white rounded-[32px] shadow-2xl border border-white/5 overflow-hidden relative p-8 sm:p-16 max-w-4xl text-center space-y-8 flex flex-col items-center justify-center min-h-[460px]">
          
          {/* Micro dots background mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none z-0"></div>
          
          {/* Concentric subtle circular glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-white/5 rounded-full filter blur-3xl opacity-60 z-0"></div>

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            {/* Animated Shield/Lock Indicator Badge (No yellow/gold used, clean white) */}
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-12 w-12 rounded-full bg-white/5 animate-ping"></span>
                <div className="p-3.5 bg-white/10 border border-white/20 rounded-2xl shadow-sm text-white">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Title with zero dashes */}
            <div className="space-y-3">
              <span className="text-[#cba135] font-black text-[10px] uppercase tracking-widest leading-none block">
                Fortress SOMS Portal
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-none">
                Secure Entrance <br />
                Coming Soon
              </h1>
            </div>

            {/* Sourced Copywrite Content (Completely dash-free!) */}
            <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed max-w-xl mx-auto">
              Our enterprise Security Operations Management System portal is currently undergoing secure credentials audit and rollout. Registered property clients and active security officers will receive encrypted invitation links to access their isolated operational ledgers soon.
            </p>

            {/* Action pill button returning to Home */}
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex justify-center items-center px-8 py-3.5 bg-white hover:bg-slate-100 text-[#032031] font-bold text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                Return To Overview
              </Link>
            </div>
          </div>

          {/* Symmetrical Mini Status Icons at bottom */}
          <div className="relative z-10 w-full pt-6 border-t border-white/10 flex items-center justify-center gap-8 text-white/55 text-[10px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#cba135]" /> SIA Audit Complete</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#cba135]" /> Launching Autumn 2026</span>
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
