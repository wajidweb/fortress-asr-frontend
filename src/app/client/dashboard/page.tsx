'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileSettings from './ProfileSettings';
import SiteRequests from './SiteRequests';
import SecureSites from './SecureSites';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { AlertTriangle } from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  
  // Layout and navigation states
  const [hasMounted, setHasMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('client-dash');

  // Client profile is complete only when company name, billing address, and representative first name are filled
  const isProfileComplete = Boolean(
    user?.clientProfile?.companyName &&
    user.clientProfile.companyName.trim() !== '' &&
    user?.clientProfile?.billingAddress &&
    user.clientProfile.billingAddress.trim() !== '' &&
    user?.firstName &&
    user.firstName.trim() !== ''
  );

  // Trigger client-only mount
  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  // Active Session Hydration: Always fetch the fresh, decrypted user profile from the database on mount
  useEffect(() => {
    if (isAuthenticated && hasMounted) {
      authService.getMe()
        .then((res) => {
          updateUser(res.user);
        })
        .catch((err) => {
          if (err.status === 401) {
            logout();
            router.push('/login');
          }
        });
    }
  }, [isAuthenticated, hasMounted, updateUser, logout, router]);

  useEffect(() => {
    if (hasMounted) {
      if (!isAuthenticated || !user || user.role !== 'CLIENT') {
        router.push('/login');
        return;
      }

      // If client profile is incomplete, strictly lock to profile settings
      if (!isProfileComplete && activeMenu !== 'client-profile') {
        setActiveMenu('client-profile');
      }
    }
  }, [hasMounted, isAuthenticated, user, isProfileComplete, activeMenu, router]);

  if (!hasMounted || !isAuthenticated || !user || user.role !== 'CLIENT') {
    return (
      <div className="min-h-screen bg-white flex flex-col gap-5 items-center justify-center text-[#032031] font-black text-sm uppercase tracking-wider select-none">
        <LoaderRectangle />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Fallback
    }
    logout();
    router.push('/login');
  };

  const renderActivePanel = () => {
    // If profile is incomplete, restrict exclusively to ProfileSettings with requirement banner
    if (!isProfileComplete) {
      return (
        <div className="w-full flex flex-col gap-6 animate-fade-in">
          <div className="w-full bg-amber-50 border border-amber-400 rounded-xl p-5 flex items-start gap-3.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                  Setup Required
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
                  Complete Your Corporate Profile
                </h3>
              </div>
              <p className="text-xs text-amber-900/80 font-semibold leading-relaxed">
                Welcome to Fortress ASR Security Operations. Before accessing monitored secure properties, submitting site deployment requests, or viewing occurrence books, please complete and save your corporate details, billing address, and authorized contact info below.
              </p>
            </div>
          </div>

          <ProfileSettings
            user={user}
            updateUser={updateUser}
            setActiveMenu={setActiveMenu}
          />
        </div>
      );
    }

    switch (activeMenu) {
      case 'client-profile':
        return (
          <ProfileSettings
            user={user}
            updateUser={updateUser}
            setActiveMenu={setActiveMenu}
          />
        );
      case 'client-sites':
        return (
          <SecureSites 
            onNavigateToRequests={() => setActiveMenu('client-requests')} 
          />
        );
      case 'client-requests':
        return (
          <SiteRequests 
            onNavigateToSites={() => setActiveMenu('client-sites')} 
          />
        );
      default:
        return (
          <div className="w-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-white border border-black rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div className="flex flex-col gap-2 max-w-xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Fortress ASR Security Systems</span>
                <h1 className="text-2xl font-black text-[#032031]">Welcome, {user.firstName || user.clientProfile?.companyName || 'Corporate Client'}</h1>
                <p className="text-xs text-black/70 font-semibold leading-relaxed">
                  Your corporate portal provides real-time access to security officers, digital geofenced properties, and service deployment requests.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveMenu('client-requests')}
                  className="px-4 py-2.5 bg-[#032031] text-white text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-black transition shadow-xs cursor-pointer"
                >
                  + Request Site Coverage
                </button>
                <button
                  onClick={() => setActiveMenu('client-sites')}
                  className="px-4 py-2.5 border border-black text-black text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-black/5 transition cursor-pointer"
                >
                  View Monitored Sites
                </button>
              </div>
            </div>

       
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-black overflow-hidden font-jakarta antialiased relative">
      
      {/* Semi-transparent dark blur backdrop overlay for mobile viewports */}
      {isSidebarOpen && isProfileComplete && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        handleLogout={handleLogout}
        user={user}
        isProfileComplete={isProfileComplete}
      />

      {/* Main Right Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        
        {/* Header Component */}
        <Header 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isProfileComplete={isProfileComplete}
        />

        {/* Content Area */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto bg-white">
          <div className="w-full h-full flex flex-col">
            {renderActivePanel()}
          </div>
        </main>
      </div>

    </div>
  );
}
