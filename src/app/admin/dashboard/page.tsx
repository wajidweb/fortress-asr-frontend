'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import Sidebar from './Sidebar';
import Header from './Header';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import GuardManagement from './GuardManagement';
import ClientManagement from './ClientManagement';
import SiteRequestsManagement from './SiteRequestsManagement';
import SiteManagement from './SiteManagement';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  
  // Hydration guard state to ensure identical server/client first render
  const [hasMounted, setHasMounted] = useState(false);
  
  // Sidebar and navigation states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('admin-dash');

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

  // Handle route protection only after client mounting
  useEffect(() => {
    if (hasMounted) {
      if (!isAuthenticated || !user || user.role !== 'SUPER_ADMIN') {
        router.push('/login');
      }
    }
  }, [hasMounted, isAuthenticated, user, router]);

  // Loading fallback for SSR and first Client render (Guarantees matching HTML outputs)
  if (!hasMounted || !isAuthenticated || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-white flex flex-col gap-5 items-center justify-center text-[#032031] font-black text-xs uppercase tracking-wider select-none">
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

  return (
    <div className="flex h-screen w-full bg-white text-black overflow-hidden font-jakarta antialiased relative">
      
      {/* Semi-transparent dark blur backdrop overlay for mobile viewports */}
      {isSidebarOpen && (
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
      />

      {/* Main Right Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        
        {/* Header Component */}
        <Header 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeMenu={activeMenu}
        />

        {/* Content Area */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto bg-white">
          {activeMenu === 'guards-dash' && <GuardManagement />}
          {activeMenu === 'clients-dash' && <ClientManagement />}
          {activeMenu === 'admin-requests' && <SiteRequestsManagement />}
          {activeMenu === 'sites-dash' && (
            <SiteManagement onNavigateToRequests={() => setActiveMenu('admin-requests')} />
          )}
          {activeMenu === 'admin-dash' && (
            <div className="w-full flex flex-col gap-6">
              <div className="w-full bg-white border-2 border-black rounded-lg p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
                <div className="flex flex-col gap-2 max-w-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Fortress ASR Operations Command</span>
                  <h1 className="text-2xl font-black text-black">Welcome, {user.firstName ? `${user.firstName} ${user.lastName}` : 'System Administrator'}</h1>
                  <p className="text-xs text-black/70 font-semibold leading-relaxed">
                    Central Command & Control System for managing active security operations, officer compliance audits, and corporate client agreements.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveMenu('admin-requests')}
                    className="px-4 py-2.5 bg-[#032031] text-white text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-black transition shadow-xs cursor-pointer"
                  >
                    Site Requests Queue
                  </button>
                  <button
                    onClick={() => setActiveMenu('sites-dash')}
                    className="px-4 py-2.5 border-2 border-black text-black text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-black/5 transition cursor-pointer"
                  >
                    Manage Properties
                  </button>
                </div>
              </div>

           
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
