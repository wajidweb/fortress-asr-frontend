'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import Sidebar from './Sidebar';
import Header from './Header';
import LoaderRectangle from '@/components/ui/LoaderRectangle';

// Import modular workspace sub-page components
import ProfileSettings from './ProfileSettings';
import { 
  MyShifts, ShiftCheckIn, SchedulesRota, PatrolTerminal, 
  OccurrenceBook, IncidentReports, WelfareChecks, SiteInstructions, 
  PanicAlert 
} from './WorkspacePanels';

export default function GuardDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  
  // Hydration guard state
  const [hasMounted, setHasMounted] = useState(false);
  
  // Sidebar and navigation states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('my-shifts');

  // SIA licensing compliance check (Checks if SIA number exists to unlock features)
  const isProfileComplete = !!(user?.guardProfile?.siaLicenceNumber);

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

  // Handle route protection and force profile settings if SIA is incomplete on first login
  useEffect(() => {
    if (hasMounted) {
      if (!isAuthenticated || !user || user.role !== 'GUARD') {
        router.push('/login');
        return;
      }

      // Compliance Lockout: If SIA details are missing, force them to complete profile
      if (!isProfileComplete) {
        setActiveMenu('profile');
      }
    }
  }, [hasMounted, isAuthenticated, user, isProfileComplete, router]);

  if (!hasMounted || !isAuthenticated || !user || user.role !== 'GUARD') {
    return (
      <div className="min-h-screen bg-white flex flex-col gap-5 items-center justify-center text-[#032031] font-black text-sm uppercase tracking-wider select-none">
        <LoaderRectangle />
        <span>Verifying Officer Credentials...</span>
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

  // Dynamic renderer mapping active menu state to the corresponding modular sub-page component
  const renderActivePanel = () => {
    switch (activeMenu) {
      case 'profile':
        return (
          <ProfileSettings 
            user={user}
            updateUser={updateUser}
            setActiveMenu={setActiveMenu}
            isProfileComplete={isProfileComplete}
          />
        );
      case 'my-shifts':
        return <MyShifts />;
      case 'check-in':
        return <ShiftCheckIn />;
      case 'my-rota':
        return <SchedulesRota />;
      case 'patrol-terminal':
        return <PatrolTerminal />;
      case 'occurrence-book':
        return <OccurrenceBook />;
      case 'guard-incidents':
        return <IncidentReports />;
      case 'welfare':
        return <WelfareChecks />;
      case 'instructions':
        return <SiteInstructions />;
      case 'panic':
        return <PanicAlert />;
      default:
        return <MyShifts />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-black overflow-hidden font-sans antialiased relative">
      
      {/* Semi-transparent dark blur backdrop overlay for mobile viewports (only clickable if profile is complete) */}
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
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto bg-slate-50/50">
          {/* Render the dynamically resolved modular sub-component panel */}
          <div className="w-full h-full flex flex-col">
            {renderActivePanel()}
          </div>
        </main>
      </div>

    </div>
  );
}
