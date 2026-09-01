'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Users, MapPin, LogOut, ChevronDown, ChevronRight, 
  Settings, Calendar, ClipboardList, LayoutGrid,
  Activity, AlertTriangle, ShieldCheck, FileText, 
  TrendingUp, Award, Wrench, Coins
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
  // Sidebar expanded groups matching the main operational clusters from the BRD/SRS and Phase docs
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    live: true,
    workforce: true,
    safety: false,
    finance: false,
    system: false,
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
                Security Operations
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Groups - Sourced directly from BRD/SRS and simplified in British English */}
        <nav className="py-4 flex flex-col gap-5 px-3">
          
          {/* Group 1: LIVE MONITORING */}
          <div className="flex flex-col gap-1 w-full">
            {isSidebarOpen ? (
              <div 
                onClick={() => toggleGroup('live')}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
              >
                <span>Live Monitoring</span>
                {expandedGroups.live ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 w-full" />
            )}
            
            <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.live ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
              
              {/* Dashboard & Live Operations */}
              <button 
                onClick={() => setActiveMenu('admin-dash')}
                title="Live Operations"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'admin-dash' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Live Operations
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'admin-dash' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Attendance */}
              <button 
                onClick={() => setActiveMenu('attendance')}
                title="Attendance"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'attendance' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Attendance
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'attendance' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Incident Management */}
              <button 
                onClick={() => setActiveMenu('incidents')}
                title="Incident Management"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'incidents' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Incidents
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'incidents' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>
            </div>
          </div>

          {/* Group 2: WORKFORCE & SITES */}
          <div className="flex flex-col gap-1 w-full">
            {isSidebarOpen ? (
              <div 
                onClick={() => toggleGroup('workforce')}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
              >
                <span>Workforce & Sites</span>
                {expandedGroups.workforce ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 w-full" />
            )}
            
            <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.workforce ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
              
              {/* Guard Management (SOMS simplified) */}
              <button 
                onClick={() => setActiveMenu('guards-dash')}
                title="Guard Management"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'guards-dash' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Guard Management
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'guards-dash' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Client Management (SOMS simplified) */}
              <button 
                onClick={() => setActiveMenu('clients-dash')}
                title="Client Management"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'clients-dash' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Client Management
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'clients-dash' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Rota / Shift Calendar */}
              <button 
                onClick={() => setActiveMenu('rota')}
                title="Rota Management"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'rota' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Rota Management
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'rota' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>
            </div>
          </div>

          {/* Group 3: SAFETY & COMPLIANCE */}
          <div className="flex flex-col gap-1 w-full">
            {isSidebarOpen ? (
              <div 
                onClick={() => toggleGroup('safety')}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
              >
                <span>Safety & Compliance</span>
                {expandedGroups.safety ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 w-full" />
            )}
            
            <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.safety ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
              
              {/* Patrol Management */}
              <button 
                onClick={() => setActiveMenu('patrols')}
                title="Patrol Management"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'patrols' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Patrol Management
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'patrols' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Compliance */}
              <button 
                onClick={() => setActiveMenu('compliance')}
                title="SIA & RTW Compliance"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'compliance' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Compliance
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'compliance' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Equipment */}
              <button 
                onClick={() => setActiveMenu('equipment')}
                title="Equipment"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'equipment' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Equipment
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'equipment' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>
            </div>
          </div>

          {/* Group 4: FINANCE & REPORTING */}
          <div className="flex flex-col gap-1 w-full">
            {isSidebarOpen ? (
              <div 
                onClick={() => toggleGroup('finance')}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-wider cursor-pointer hover:text-white transition"
              >
                <span>Finance & Reports</span>
                {expandedGroups.finance ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 w-full" />
            )}
            
            <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.finance ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
              
              {/* Finance & Timesheets */}
              <button 
                onClick={() => setActiveMenu('finance')}
                title="Finance & Timesheets"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'finance' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Coins className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Finance & Timesheets
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'finance' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Reports & Analytics */}
              <button 
                onClick={() => setActiveMenu('reports')}
                title="Reports & Analytics"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-start gap-2' : 'p-2.5 justify-center'}
                  ${activeMenu === 'reports' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                  Reports & Analytics
                </span>
              </button>
            </div>
          </div>

          {/* Group 5: SYSTEM CONTROL */}
          <div className="flex flex-col gap-1 w-full">
            {isSidebarOpen ? (
              <div 
                onClick={() => toggleGroup('system')}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-white transition"
              >
                <span>System Controls</span>
                {expandedGroups.system ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 w-full" />
            )}
            
            <div className={`flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isSidebarOpen && !expandedGroups.system ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-96 opacity-100'}`}>
              
              {/* Settings (Phase 04 Company Settings - renamed to simple) */}
              <button 
                onClick={() => setActiveMenu('company-settings')}
                title="Settings"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'company-settings' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Settings className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Settings
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'company-settings' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Users & Roles (Phase 03 Users & Roles) */}
              <button 
                onClick={() => setActiveMenu('users-roles')}
                title="Users & Roles"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'users-roles' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Users & Roles
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'users-roles' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>

              {/* Audit Logs (Phase 32 Audit Logs) */}
              <button 
                onClick={() => setActiveMenu('audit-logs')}
                title="Audit Logs"
                className={`w-full flex items-center rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'px-3 py-2 justify-between' : 'p-2.5 justify-center'}
                  ${activeMenu === 'audit-logs' ? 'bg-white text-[#032031]' : 'hover:bg-white/5 text-white'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className={`transition-all duration-300 ease-in-out truncate ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    Audit Logs
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full bg-[#032031] transition-all duration-300 ${isSidebarOpen && activeMenu === 'audit-logs' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              </button>
            </div>
          </div>

        </nav>
      </div>

      {/* Simplified Bottom Logout Button (Blends seamlessly with the full sidebar background) */}
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
