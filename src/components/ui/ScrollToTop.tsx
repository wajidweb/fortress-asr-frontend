'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Monitor window scroll offset to toggle visibility dynamically
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-2 bg-[#032031] text-white rounded-full shadow-lg border border-white/10 hover:bg-slate-800 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#032031] ${
        isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-75 pointer-events-none'
      }`}
      style={{ width: '32px', height: '32px' }} // Explicitly constrained to a very small, elegant 32px diameter
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-4 h-4" />
    </button>
  );
};

export default ScrollToTop;
