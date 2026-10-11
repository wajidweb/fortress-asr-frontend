'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Users, MapPin, LogOut, ChevronDown, ChevronRight, 
  Settings, Calendar, ClipboardList, LayoutGrid,
  Activity, AlertTriangle, ShieldCheck, FileText, 
  Shield, ChevronLeft, ChevronRight as ChevronRightIcon,
  Building2, Lock, ShieldAlert
} from 'lucide-react';
import { User } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

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
  const addToast = useUIStore((state) => state.addToast);

  // Collapsible navigation groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    portal: true,
    safety: false,
  });

  const toggleGroup = (group: string) => {
    if (isSidebarOpen && isProfileComplete) {
      setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    }
  };

  const handleMenuClick = (menuKey: string) => {
    if (!isProfileComplete && menuKey !== 'client-profile') {
      addToast('Please complete your corporate profile settings first to unlock this section.', 'info');
      return;
    }
    setActiveMenu(menuKey);
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
                sizes="24px"
                className="object-contain rounded"
              />
            </div>
            
            <div className={`flex flex-col truncate transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 pointer-events-none'}`}>
              <span className="text-white text-[11px] font-black tracking-wider uppercase leading-none truncate">
                Fortress ASR
              </span>
              <span className="text-[7px] text-white/60 font-bold uppercase tracking-widest mt-1">
                Client Portal
              </span>
            </div>
          </div>

          {/* Collapse Button (Identical to Guard Sidebar Collapse design) */}
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

        {/* Profile Setup Required Warning Banner */}
        {!isProfileComplete && isSidebarOpen && (
          <div className="m-3 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-start gap-2.5 select-none animate-pulse">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase text-amber-300">Profile Setup Required</span>
              <span className="text-[8px] text-white/80 font-bold leading-relaxed">
                Complete your corporate profile details to unlock monitored sites, site requests, and operational reports.
              </span>
            </div>
          </div>
        )}

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
                onClick={() => handleMenuClick('client-dash')}
                disabled={!isProfileComplete}
                title={!isProfileComplete ? "Complete profile setup to unlock" : "Overview Dashboard"}
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${!isProfileComplete 
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent text-white/50' 
                    : (activeMenu === 'client-dash' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white')
                  }
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Overview
                  </span>
                </div>
                {isSidebarOpen && !isProfileComplete ? (
                  <Lock className="w-3 h-3 text-white/40 shrink-0" />
                ) : (
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-dash' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                )}
              </button>

              {/* Monitored Sites */}
              <button 
                onClick={() => handleMenuClick('client-sites')}
                disabled={!isProfileComplete}
                title={!isProfileComplete ? "Complete profile setup to unlock" : "Monitored Sites"}
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${!isProfileComplete 
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent text-white/50' 
                    : (activeMenu === 'client-sites' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white')
                  }
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Secure Sites
                  </span>
                </div>
                {isSidebarOpen && !isProfileComplete ? (
                  <Lock className="w-3 h-3 text-white/40 shrink-0" />
                ) : (
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-sites' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                )}
              </button>

              {/* Site Service Requests */}
              <button 
                onClick={() => handleMenuClick('client-requests')}
                disabled={!isProfileComplete}
                title={!isProfileComplete ? "Complete profile setup to unlock" : "Site Deployment Requests"}
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${!isProfileComplete 
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent text-white/50' 
                    : (activeMenu === 'client-requests' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white')
                  }
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Site Requests
                  </span>
                </div>
                {isSidebarOpen && !isProfileComplete ? (
                  <Lock className="w-3 h-3 text-white/40 shrink-0" />
                ) : (
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-requests' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                )}
              </button>

              {/* Occurrence Book */}
              <button 
                onClick={() => handleMenuClick('client-dob')}
                disabled={!isProfileComplete}
                title={!isProfileComplete ? "Complete profile setup to unlock" : "Occurrence Book"}
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${!isProfileComplete 
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent text-white/50' 
                    : (activeMenu === 'client-dob' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white')
                  }
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Occurrence Book
                  </span>
                </div>
                {isSidebarOpen && !isProfileComplete ? (
                  <Lock className="w-3 h-3 text-white/40 shrink-0" />
                ) : (
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-dob' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                )}
              </button>

              {/* Profile Settings - Always Accessible */}
              <button 
                onClick={() => setActiveMenu('client-profile')}
                title="Profile Settings"
                className={`w-full flex items-center rounded-lg text-[10px] tracking-wide transition-all duration-300 ease-in-out cursor-pointer
                  ${isSidebarOpen ? 'px-3 py-2.5 justify-between' : 'p-2.5 justify-center'}
                  ${!isProfileComplete 
                    ? 'bg-amber-400 text-black font-black shadow-md border-2 border-amber-300 hover:bg-amber-300' 
                    : (activeMenu === 'client-profile' 
                        ? 'bg-white text-[#032031] font-bold shadow-sm' 
                        : 'hover:bg-white/10 text-white font-medium'
                      )
                  }
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Settings className={`w-3.5 h-3.5 shrink-0 ${!isProfileComplete ? 'text-black' : (activeMenu === 'client-profile' ? 'text-[#032031]' : 'text-white')}`} />
                  <span className={`transition-all duration-300 ease-in-out truncate ${!isProfileComplete ? 'text-black font-black' : ''} ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Profile Settings
                  </span>
                </div>
                {isSidebarOpen && !isProfileComplete ? (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black text-amber-300 leading-none shrink-0 tracking-wider shadow-xs animate-pulse">
                    Required
                  </span>
                ) : (
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                )}
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
                onClick={() => handleMenuClick('client-incidents')}
                disabled={!isProfileComplete}
                title={!isProfileComplete ? "Complete profile setup to unlock" : "Incident Logs"}
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${!isProfileComplete 
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent text-white/50' 
                    : (activeMenu === 'client-incidents' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white')
                  }
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Incident Reports
                  </span>
                </div>
                {isSidebarOpen && !isProfileComplete ? (
                  <Lock className="w-3 h-3 text-white/40 shrink-0" />
                ) : (
                  <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'client-incidents' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                )}
              </button>
            </div>
          </div>

        </nav>
      </div>

      {/* Sidebar Footer Account row (Identical to Guard Sidebar Footer account row styling) */}
      <div className="border-t border-white/10 p-3 flex flex-col gap-2 bg-black/10 shrink-0">
      

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
