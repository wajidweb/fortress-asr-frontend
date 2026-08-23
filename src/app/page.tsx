'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/ui/Loader';
import ScrollToTop from '@/components/ui/ScrollToTop';

// Dynamic sectional components imports
import Hero from '@/components/sections/Hero';
import Operations from '@/components/sections/Operations';
import Guards from '@/components/sections/Guards';
import ClientsSites from '@/components/sections/ClientsSites';
import DailyOps from '@/components/sections/DailyOps';
import MobileApp from '@/components/sections/MobileApp';
import ClientVisibility from '@/components/sections/ClientVisibility';
import Workflow from '@/components/sections/Workflow';
import Security from '@/components/sections/Security';

export default function Home() {
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

      {/* Main Container composing granular homepage sections (Overview) */}
      <div className="flex-grow flex flex-col w-full animate-fade-in">
        {/* 01. Welcome / Hero Section */}
        <Hero />

        {/* 02. Our Operations Section */}
        <Operations />

        {/* 03. Our Guards Section */}
        <Guards />

        {/* 04. Our Clients & Sites Section */}
        <ClientsSites />

        {/* 05. Daily Operations Section */}
        <DailyOps />

        {/* 06. Guard Mobile App Section */}
        <MobileApp />

        {/* 07. Client Visibility Section */}
        <ClientVisibility />

        {/* 08. Everything in One Place Flowchart */}
        <Workflow />

        {/* 09. Secure & Organised Section */}
        <Security />
      </div>

      {/* 10. Dynamic Footer */}
      <Footer />

      {/* 11. Miniature Floating Scroll-To-Top Button (Fixed Bottom-Right) */}
      <ScrollToTop />
    </div>
  );
}
