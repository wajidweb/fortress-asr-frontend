'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Users, MapPin, LogOut, ChevronDown, ChevronRight, 
  Settings, Calendar, ClipboardList, LayoutGrid,
  Activity, AlertTriangle, ShieldCheck, FileText, 
  BellRing, Compass, LogIn, ChevronLeft, ChevronRight as ChevronRightIcon,
  ShieldAlert
} from 'lucide-react';
import { User } from '@/store/useAuthStore';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  handleLogout: () => void;
  user: User;
  isProfileComplete: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeMenu,
  setActiveMenu,
  handleLogout,
  user,
  isProfileComplete
}) => {
  // Sidebar expanded groups matching the Guard Mobile App modules from the BRD/SRS
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    duty: true,
    patrols: false,
    safety: false,
  });

  const toggleGroup = (group: string) => {
    // Only allow toggling other groups if profile is compliant/complete
    if (isSidebarOpen && isProfileComplete) {
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
        
        {/* Sidebar Brand Header with /logo.png */}
        <div className="h-16 border-b border-white/10 flex items-center transition-all duration-300 px-4 justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="relative w-6 h-6 shrink-0 transition-transform duration-300">
              <Image 
                src="/logo.png" 
                alt="Fortress ASR" 
                fill 
                sizes="24px"
                className="object-contain rounded"
              />
            </div>
            
            <div className={`flex flex-col truncate transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 pointer-events-none'}`}>
              <span className="text-white text-[11px] font-black tracking-wider uppercase leading-none">
                Fortress ASR
              </span>
              <span className="text-[7px] text-white/60 font-bold uppercase tracking-widest mt-1">
                Guard Mobile Console
              </span>
            </div>
          </div>

          {/* Collapse Button (Only clickable if profile is compliant to prevent layout breaking) */}
          {isProfileComplete && (
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
          )}
        </div>

        {/* Compliance lock warning banner on Sidebar */}
        {!isProfileComplete && isSidebarOpen && (
          <div className="m-3 p-3 bg-red-950/30 border border-red-500/20 rounded-xl flex items-start gap-2.5 select-none animate-pulse">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase text-red-400">Compliance Lock</span>
              <span className="text-[8px] text-white/80 font-bold leading-relaxed">
                Fill in your SIA Licence audit details to unlock shifts & patrols.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Groups - Sourced directly from Guard Mobile App SRS Sections */}
        <nav className="py-2 flex flex-col gap-5 px-3">
          
          {/* Group 1: DUTY TERMINAL */}
          <div className="flex flex-col gap-1 w-full">
            {isSidebarOpen ? (
              <div 
                onClick={() => toggleGroup('duty')}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
              >
                <span>Duty Terminal</span>
                {isProfileComplete && (expandedGroups.duty ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />)}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 w-full" />
            )}
            
            <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.duty ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
              
              {/* My Profile - ALWAYS accessible so they can complete compliance */}
              <button 
                onClick={() => setActiveMenu('profile')}
                title="My Profile"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'profile' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Settings className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    My Profile
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* My Shifts - Locked if profile is incomplete */}
              {isProfileComplete && (
                <button 
                  onClick={() => setActiveMenu('my-shifts')}
                  title="My Shifts"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'my-shifts' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      My Shifts
                    </span>
                  </div>
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'my-shifts' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                </button>
              )}

              {/* Visual Check In - Locked if profile is incomplete */}
              {isProfileComplete && (
                <button 
                  onClick={() => setActiveMenu('check-in')}
                  title="Shift Check In"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'check-in' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <LogIn className="w-3.5 h-3.5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      Shift Check In
                    </span>
                  </div>
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'check-in' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                </button>
              )}

              {/* Guard Shift Calendar Rota - Locked if profile is incomplete */}
              {isProfileComplete && (
                <button 
                  onClick={() => setActiveMenu('my-rota')}
                  title="Schedules Rota"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'my-rota' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      Schedules Rota
                    </span>
                  </div>
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'my-rota' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                </button>
              )}
            </div>
          </div>

          {/* Group 2: PATROLS & LOGS - Locked if profile is incomplete */}
          {isProfileComplete && (
            <div className="flex flex-col gap-1 w-full animate-fade-in">
              {isSidebarOpen ? (
                <div 
                  onClick={() => toggleGroup('patrols')}
                  className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
                >
                  <span>Patrols & Logs</span>
                  {expandedGroups.patrols ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
                </div>
              ) : (
                <div className="h-px bg-white/10 my-2 w-full" />
              )}
              
              <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.patrols ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
                
                {/* Patrol Execution */}
                <button 
                  onClick={() => setActiveMenu('patrol-terminal')}
                  title="Patrol Terminal"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'patrol-terminal' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      Patrol Terminal
                    </span>
                  </div>
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'patrol-terminal' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                </button>

                {/* Digital DOB */}
                <button 
                  onClick={() => setActiveMenu('occurrence-book')}
                  title="Occurrence Book"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'occurrence-book' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      Occurrence Book
                    </span>
                  </div>
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'occurrence-book' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                </button>

                {/* Incident Reporting */}
                <button 
                  onClick={() => setActiveMenu('guard-incidents')}
                  title="Incident Reports"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'guard-incidents' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      Incident Reports
                    </span>
                  </div>
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'guard-incidents' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Group 3: SAFETY & COMMS - Locked if profile is incomplete */}
          {isProfileComplete && (
            <div className="flex flex-col gap-1 w-full animate-fade-in">
              {isSidebarOpen ? (
                <div 
                  onClick={() => toggleGroup('safety')}
                  className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
                >
                  <span>Safety & Comms</span>
                  {expandedGroups.safety ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
                </div>
              ) : (
                <div className="h-px bg-white/10 my-2 w-full" />
              )}
              
              <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.safety ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
                
                {/* Welfare Checks */}
                <button 
                  onClick={() => setActiveMenu('welfare')}
                  title="Welfare Checks"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'welfare' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      Welfare Checks
                    </span>
                  </div>
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'welfare' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                </button>

                {/* Site Instructions */}
                <button 
                  onClick={() => setActiveMenu('instructions')}
                  title="Site Instructions"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'instructions' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      Site Instructions
                    </span>
                  </div>
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'instructions' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                </button>

                {/* Panic / Emergency */}
                <button 
                  onClick={() => setActiveMenu('panic')}
                  title="Panic Alert"
                  className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                    ${activeMenu === 'panic' ? 'bg-[#032031] text-red-400 border border-red-500/20' : 'hover:bg-red-500/10 text-red-200'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500 animate-pulse" />
                    <span className={`transition-all duration-300 ease-in-out truncate font-black ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      Panic Alert
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

        </nav>
      </div>

      {/* Simplified Bottom Logout Button */}
      <div className="border-t border-white/10 p-3 flex justify-center bg-transparent">
        <button 
          onClick={handleLogout}
          className={`
            flex items-center justify-center text-white border border-white/15 hover:bg-white/10 hover:border-white transition-all duration-300 ease-in-out focus:outline-none select-none text-[10px] font-bold uppercase tracking-wider
            ${isSidebarOpen ? 'w-full gap-2 px-4 py-2.5 rounded-lg' : 'w-10 h-10 p-0 rounded-xl'}
          `}
          title="Secure Logout"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
            Logout
          </span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
