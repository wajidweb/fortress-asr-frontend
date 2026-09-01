'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Users, MapPin, LogOut, ChevronDown, ChevronRight, 
  Settings, Calendar, ClipboardList, LayoutGrid,
  Activity, AlertTriangle, ShieldCheck, FileText, 
  Shield, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { User } from '@/store/useAuthStore';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  handleLogout: () => void;
  user: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeMenu,
  setActiveMenu,
  handleLogout,
  user
}) => {
  // Collapsible navigation groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    portal: true,
    safety: false,
  });

  const toggleGroup = (group: string) => {
    if (isSidebarOpen) {
      setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    }
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 bg-[#032031] text-white flex flex-col justify-between border-r border-white/10 transition-all duration-300 ease-in-out select-none
      ${isSidebarOpen 
        ? 'w-60 translate-x-0' 
        : 'hidden lg:flex w-16 lg:translate-x-0'
      } 
      lg:relative lg:translate-x-0 shrink-0
    `}>
      <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-grow scrollbar-thin">
        
        {/* Sidebar Brand Header with /logo.png & Manual Collapse toggles */}
        <div className="h-16 border-b border-white/10 flex items-center transition-all duration-300 px-4 justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="relative w-6 h-6 shrink-0 transition-transform duration-300">
              <Image 
                src="/logo.png" 
                alt="Fortress ASR" 
                fill 
                className="object-contain rounded"
              />
            </div>
            
            <div className={`flex flex-col truncate transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 pointer-events-none'}`}>
              <span className="text-white text-[11px] font-black tracking-wider uppercase leading-none">
                Fortress ASR
              </span>
              <span className="text-[7px] text-white/60 font-bold uppercase tracking-widest mt-1">
                Client Portal
              </span>
            </div>
          </div>

          {/* Collapse Button (Identical to Guard Sidebar Collapse design) */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`
              p-1 rounded-lg border border-white/10 bg-[#02141F] text-white hover:bg-white/10 hover:border-white focus:outline-none transition duration-200 shrink-0
              ${isSidebarOpen ? 'flex' : 'hidden lg:flex absolute top-3.5 right-[-14px] z-50 w-7 h-7 items-center justify-center rounded-full shadow-lg'}
            `}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="py-4 flex flex-col gap-5 px-3">
          
          {/* Group 1: CORPORATE PORTAL */}
          <div className="flex flex-col gap-1 w-full">
            {isSidebarOpen ? (
              <div 
                onClick={() => toggleGroup('portal')}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
              >
                <span>Corporate Portal</span>
                {expandedGroups.portal ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 w-full" />
            )}
            
            <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.portal ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
              
              {/* Corporate Overview */}
              <button 
                onClick={() => setActiveMenu('client-dash')}
                title="Overview Dashboard"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'client-dash' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Overview
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-dash' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Monitored Sites */}
              <button 
                onClick={() => setActiveMenu('client-sites')}
                title="Monitored Sites"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'client-sites' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Secure Sites
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-sites' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Occurrence Book */}
              <button 
                onClick={() => setActiveMenu('client-dob')}
                title="Occurrence Book"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'client-dob' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Occurrence Book
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-dob' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>
            </div>
          </div>

          {/* Group 2: COMPLIANCE & SAFETY */}
          <div className="flex flex-col gap-1 w-full">
            {isSidebarOpen ? (
              <div 
                onClick={() => toggleGroup('safety')}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
              >
                <span>Compliance & Safety</span>
                {expandedGroups.safety ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 w-full" />
            )}
            
            <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.safety ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
              
              {/* Incident Reports */}
              <button 
                onClick={() => setActiveMenu('client-incidents')}
                title="Incident Logs"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'client-incidents' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Incident Reports
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-incidents' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>
            </div>
          </div>

        </nav>
      </div>

      {/* Sidebar Footer Account row (Identical to Guard Sidebar Footer account row styling) */}
      <div className="border-t border-white/10 p-3 flex flex-col gap-2 bg-black/10 shrink-0">
        <div className={`flex items-center gap-2.5 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <div className="w-7 h-7 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-white">{user.firstName[0]}{user.lastName[0]}</span>
          </div>
          <div className={`flex flex-col truncate transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
            <span className="text-[10px] font-black leading-none truncate text-white">{user.firstName} {user.lastName}</span>
            <span className="text-[7px] text-white/50 font-black uppercase mt-1 leading-none tracking-widest">Client Partner</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-2 text-white/70 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors duration-200
            ${isSidebarOpen ? 'px-3 py-2.5 hover:bg-white/5' : 'p-2.5 justify-center'}
          `}
          title="Logout Session"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className={`transition-all duration-300 truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
            Logout
          </span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
