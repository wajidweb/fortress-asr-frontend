'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getFullImageUrl } from '@/services/api';
import { Menu, Bell, Settings, Maximize2, Minimize2, Clock, Calendar } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeMenu: string;
  setActiveMenu?: (menu: string) => void;
  isProfileComplete?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeMenu,
  setActiveMenu,
  isProfileComplete = true
}) => {
  const { user } = useAuthStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Live real-time clock based on user's laptop/device time
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state with native browser fullscreen changes (including pressing Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFull = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const doc = document as any;
    const docEl = document.documentElement as any;

    const isFull = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFull) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  const getHeaderTitle = () => {
    switch (activeMenu) {
      case 'client-dash':
        return 'Overview Dashboard';
      case 'client-sites':
        return 'Monitored Sites';
      case 'client-requests':
        return 'Site Service Requests';
      case 'client-dob':
        return 'Occurrence Book';
      case 'client-incidents':
        return 'Incident Reports';
      case 'client-profile':
        return 'Profile Settings';
      default:
        return 'Overview Dashboard';
    }
  };

  const getInitials = () => {
    if (!user) return 'CP';
    const first = user.firstName ? user.firstName[0] : '';
    const last = user.lastName ? user.lastName[0] : '';
    return (first + last).toUpperCase() || 'CP';
  };

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString(undefined, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : '';

  return (
    <header className="h-16 border-b border-black/15 px-6 flex items-center justify-between select-none bg-white shrink-0">
      
      {/* Header Left: Dynamic Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-1.5 border border-black rounded-lg text-black hover:bg-black hover:text-white focus:outline-none transition shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-black text-black tracking-tight transition-all duration-300 flex items-center gap-2">
          <span>{getHeaderTitle()}</span>
          {!isProfileComplete && (
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              Setup Required
            </span>
          )}
        </h2>
      </div>

      {/* Header Middle-Right */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Real-time Operations Clock (Local Laptop / Machine Time) */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-black/5 border border-black/15 rounded-xl select-none shadow-2xs">
          <div className="flex items-center gap-1.5 text-black">
            <Clock className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="text-[10px] font-bold tracking-tight tabular-nums">
              {currentTime ? formattedTime : '--:--:--'}
            </span>
          </div>
          <span className="h-3 w-px bg-black/20" />
          <div className="flex items-center gap-1.5 text-black/70">
            <Calendar className="w-3 h-3 text-black/50 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight tabular-nums">
              {currentTime ? formattedDate : 'Loading date...'}
            </span>
          </div>
        </div>

        {/* Header Right Action Icons (Fullscreen, Bell & Settings) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Full Screen Toggle Button */}
          <button 
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-black/5 rounded-full text-black transition cursor-pointer"
            title={isFullscreen ? "Exit Full Screen (Esc)" : "Full Screen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-black" />
            ) : (
              <Maximize2 className="w-4 h-4 text-black" />
            )}
          </button>

          <button className="p-1.5 hover:bg-black/5 rounded-full text-black transition animate-fade-in" title="Notifications">
            <Bell className="w-4 h-4 text-black" />
          </button>
          <button 
            onClick={() => setActiveMenu && setActiveMenu('client-profile')}
            className="p-1.5 hover:bg-black/5 rounded-full text-black transition animate-fade-in cursor-pointer" 
            title="Settings"
          >
            <Settings className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* User Account Info capsule */}
        {user && (
          <div className="flex items-center gap-2.5 pl-4 border-l border-black/20">
            <span className="hidden sm:inline text-[10px] font-bold text-black tracking-tight">
              {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
            </span>
            <div className="w-7 h-7 rounded-full bg-black text-white font-black flex items-center justify-center text-[10px] tracking-tight shrink-0 border border-black select-none shadow-sm overflow-hidden relative">
              {user?.clientProfile?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getFullImageUrl(user.clientProfile.logoUrl)}
                  alt={user.firstName || 'Client'}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
          </div>
        )}

      </div>
      
    </header>
  );
};

export default Header;
