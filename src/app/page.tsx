'use client';

import React, { useState, useEffect } from 'react';
import Loader from '@/components/ui/Loader';

export default function Home() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Simulate initial mount/loading state to show off the custom security loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200); // Display loader for 1.2 seconds for a premium, polished feel

    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return <Loader fullScreen />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-6 animate-fade-in">
      <div className="text-center max-w-xl flex flex-col items-center">
        {/* Animated Security Loader Preview */}
        <Loader size={160} className="mb-8" />

        <h1 className="text-4xl font-black tracking-wider text-amber-500 sm:text-5xl uppercase">
          Fortress ASR
        </h1>
        <p className="text-lg text-slate-300 font-semibold mt-4">
          Security Operations Management System (SOMS)
        </p>
        <div className="w-16 h-1 bg-amber-500 mx-auto my-6 rounded"></div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Welcome to the Fortress ASR workspace. The animated security loader is fully loaded and can be imported anywhere using:
          <code className="block mt-3 p-2 bg-slate-800 text-amber-400 rounded text-xs select-all">
            import Loader from '@/components/ui/Loader';
          </code>
        </p>
      </div>
    </main>
  );
}
