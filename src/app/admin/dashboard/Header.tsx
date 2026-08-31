'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Menu, Search, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeMenu: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeMenu
}) => {
  const { user } = useAuthStore();

  // Helper to map activeMenu state to human-readable simplified British English titles
  const getHeaderTitle = () => {
    switch (activeMenu) {
      case 'admin-dash':
        return 'Live Operations';
      case 'attendance':
        return 'Attendance';
      case 'incidents':
        return 'Incidents';
      case 'guards-dash':
        return 'Guard Management';
      case 'clients-dash':
        return 'Client Management';
      case 'rota':
        return 'Rota Management';
      case 'patrols':
        return 'Patrol Management';
      case 'compliance':
        return 'Compliance';
      case 'equipment':
        return 'Equipment';
      case 'finance':
        return 'Finance & Timesheets';
      case 'reports':
        return 'Reports & Analytics';
      case 'company-settings':
        return 'Settings';
      case 'users-roles':
        return 'Users & Roles';
      case 'audit-logs':
        return 'Audit Logs';
      default:
        return 'Live Operations';
    }
  };

  return (
    <header className="h-16 border-b border-slate-100 px-6 flex items-center justify-between select-none bg-white">
      
      {/* Header Left: Dynamic Title based on Active Menu (And Mobile Hamburger menu) */}
      <div className="flex items-center gap-3">
        {/* Toggle Button visible only on Mobile/Tablet viewports */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-1.5 border border-slate-200 rounded-lg text-[#032031] hover:border-black focus:outline-none transition shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-black text-[#032031] tracking-tight transition-all duration-300">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Header Middle-Right: Premium Pill Search Bar (Matching reference image exactly) */}
      <div className="flex items-center gap-6">
        
        {/* Search Box with ⌘ + K shortcuts inside */}
        <div className="hidden md:flex items-center relative w-64 xl:w-80">
          <input 
            type="text" 
            placeholder="Search here..." 
            className="w-full pl-9 pr-16 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold focus:outline-none focus:border-[#032031] focus:ring-1 focus:ring-[#032031]/10 placeholder-slate-400 bg-white text-black transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
          
          
        </div>

        {/* Header Right Action Icons (Bell & Settings) */}
        <div className="flex items-center gap-3">
          <button className="p-1.5 hover:bg-slate-50 rounded-full text-black transition">
            <Bell className="w-4 h-4 text-[#032031]" />
          </button>
          {/* Settings icon replacing moon */}
          <button className="p-1.5 hover:bg-slate-50 rounded-full text-black transition" title="Settings">
            <Settings className="w-4 h-4 text-[#032031]" />
          </button>
        </div>

        {/* User Account Info capsule (Matching Ryder Collins profile row) */}
        {user && (
          <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200">
            {/* User name in ultra-compact typography */}
            <span className="hidden sm:inline text-[10px] font-bold text-black tracking-tight">
              {user.firstName} {user.lastName}
            </span>
            {/* User initials circle */}
            <div className="w-7 h-7 rounded-full bg-[#032031] text-white font-black flex items-center justify-center text-[10px] tracking-tight shrink-0 border border-black/5 select-none shadow-sm">
              SA
            </div>
          </div>
        )}

      </div>
      
    </header>
  );
};
export default Header;
