'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/ui/Loader';
import ScrollToTop from '@/components/ui/ScrollToTop';
import RegisterForm from '@/components/sections/RegisterForm';

export default function RegisterPage() {
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

      {/* Main Registration Content wrapped inside standard Tailwind container margins */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex items-center justify-center animate-fade-in">
        <RegisterForm />
      </div>

      {/* 10. Dynamic Footer */}
      <Footer />

      {/* 11. Miniature Floating Scroll-To-Top Button (Fixed Bottom-Right) */}
      <ScrollToTop />
    </div>
  );
}
