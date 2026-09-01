'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Menu, Search, Bell, Settings, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isProfileComplete: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeMenu,
  setActiveMenu,
  isProfileComplete
}) => {
  const { user } = useAuthStore();

  const getHeaderTitle = () => {
    switch (activeMenu) {
      case 'my-shifts':
        return 'My Shifts';
      case 'check-in':
        return 'Shift Check In';
      case 'my-rota':
        return 'Schedules Rota';
      case 'patrol-terminal':
        return 'Patrol Terminal';
      case 'occurrence-book':
        return 'Occurrence Book';
      case 'guard-incidents':
        return 'Incident Reports';
      case 'welfare':
        return 'Welfare Checks';
      case 'instructions':
        return 'Site Instructions';
      case 'panic':
        return 'Panic Alert';
      case 'profile':
        return 'Profile Settings';
      default:
        return 'My Shifts';
    }
  };

  const getInitials = () => {
    if (!user) return 'SG';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <header className="h-16 border-b border-slate-100 px-6 flex items-center justify-between select-none bg-white">
      
      {/* Header Left: Dynamic Title (And Mobile Hamburger menu) */}
      <div className="flex items-center gap-3">
        {/* Toggle Button visible only on Mobile/Tablet viewports when compliant */}
        {isProfileComplete && (
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 border border-slate-200 rounded-lg text-[#032031] hover:border-black focus:outline-none transition shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <h2 className="text-sm font-black text-[#032031] tracking-tight transition-all duration-300">
          {getHeaderTitle()} {!isProfileComplete && <span className="text-red-500 font-bold ml-1.5">(Compliance Lock)</span>}
        </h2>
      </div>

      {/* Header Middle-Right: Premium Pill Search Bar */}
      <div className="flex items-center gap-6">
        
        {/* Search Box (Only unlocked if profile is complete) */}
        {isProfileComplete && (
          <div className="hidden md:flex items-center relative w-64 xl:w-80 animate-fade-in">
            <input 
              type="text" 
              placeholder="Search here..." 
              className="w-full pl-9 pr-16 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031]/10 placeholder-slate-400 bg-white text-black transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
            <div className="absolute right-2.5 flex items-center gap-1 select-none pointer-events-none">
              <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-[8px] font-black rounded uppercase text-black leading-none">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-[8px] font-black rounded uppercase text-black leading-none">K</kbd>
            </div>
          </div>
        )}

        {/* Header Right Action Icons (Bell & Settings) */}
        <div className="flex items-center gap-3">
          {isProfileComplete && (
            <button className="p-1.5 hover:bg-slate-50 rounded-full text-black transition animate-fade-in">
              <Bell className="w-4 h-4 text-[#032031]" />
            </button>
          )}
          {isProfileComplete && (
            <button 
              onClick={() => setActiveMenu('profile')}
              className="p-1.5 hover:bg-slate-50 rounded-full text-black transition animate-fade-in" 
              title="Settings"
            >
              <Settings className="w-4 h-4 text-[#032031]" />
            </button>
          )}
          
          {/* Header lock reminder indicator when locked */}
          {!isProfileComplete && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider select-none animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span>Pending SIA Audit</span>
            </div>
          )}
        </div>

        {/* User Account Info capsule */}
        {user && (
          <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200">
            {/* User name in ultra-compact typography */}
            <span className="hidden sm:inline text-[10px] font-bold text-black tracking-tight">
              {user.firstName} {user.lastName}
            </span>
            {/* User initials circle */}
            <div className="w-7 h-7 rounded-full bg-[#032031] text-white font-black flex items-center justify-center text-[10px] tracking-tight shrink-0 border border-black/5 select-none shadow-sm">
              {getInitials()}
            </div>
          </div>
        )}

      </div>
      
    </header>
  );
};

export default Header;
