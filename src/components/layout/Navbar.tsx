'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Modular Menu Items navigating to distinct Next.js pages
  const menuItems = [
    { id: 'home', label: 'Overview', href: '/' },
    { id: 'register', label: 'Guard Registration', href: '/register' },
  ];

  return (
    <nav className="w-full bg-[#032031] border-b border-white/5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title (Aligned Left) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <Image 
                  src="/logo.png" 
                  alt="Fortress ASR" 
                  fill 
                  className="object-contain rounded"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-base font-black tracking-wider uppercase leading-none">
                  Fortress ASR
                </span>
                <span className="text-[8px] text-white/50 font-bold uppercase tracking-widest mt-1">
                  Security Operations
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Group (Aligned Right) */}
          <div className="hidden md:flex items-center gap-8">
            {/* Menu Links - Simple White, Smaller Text, Perfectly Static Spacing and Weight */}
            <div className="flex items-center gap-6">
              {menuItems.map((item) => {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="text-xs text-white font-semibold tracking-wider uppercase transition-colors duration-200 hover:text-white/80"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Action Button (Secure Entrance - Navigates to Register Page for demo) */}
            <Link 
              href="/coming-soon"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#032031] hover:bg-slate-100 font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300"
            >
              <Lock className="w-3.5 h-3.5" />
              Secure Entrance
            </Link>
          </div>

          {/* Mobile Menu Toggle button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:text-white/80 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#032031] border-t border-white/5 transition-all duration-300">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {menuItems.map((item) => {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block py-3 text-xs text-white font-semibold tracking-wider uppercase pl-2 transition-colors duration-200 hover:text-white/80"
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/5">
              <Link 
                href="/coming-soon"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#032031] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
              >
                <Lock className="w-4 h-4" />
                Secure Entrance
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
