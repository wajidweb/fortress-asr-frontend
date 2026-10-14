'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, hasPermission } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import Sidebar from './Sidebar';
import Header from './Header';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import GuardManagement from './GuardManagement';
import ClientManagement from './ClientManagement';
import SiteRequestsManagement from './SiteRequestsManagement';
import SiteManagement from './SiteManagement';
import AuditLogsManagement from './AuditLogsManagement';
import UsersRolesManagement from './UsersRolesManagement';
import AdminSettings from './AdminSettings';


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

  // Active Session Hydration & Deactivation Check: Always verify user active status from database
  useEffect(() => {
    if (isAuthenticated && hasMounted) {
      authService.getMe()
        .then((res) => {
          if (!res.user.isActive) {
            logout();
            router.push('/login?deactivated=true');
          } else {
            updateUser(res.user);
          }
        })
        .catch((err) => {
          if (err.status === 401 || err.data?.isDeactivated) {
            logout();
            router.push('/login?deactivated=true');
          }
        });
    }
  }, [isAuthenticated, hasMounted, activeMenu, updateUser, logout, router]);

  // Handle route protection only after client mounting
  useEffect(() => {
    if (hasMounted) {
      if (!isAuthenticated || !user || (user.role !== 'SUPER_ADMIN' && user.role !== 'SUPERVISOR')) {
        router.push('/login');
      }
    }
  }, [hasMounted, isAuthenticated, user, router]);

  // Active Menu Permission Fallback: If user navigates to an unauthorized tab, safely fallback to Live Operations
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      if (activeMenu === 'guards-dash' && !hasPermission(user, 'guards:read')) {
        setActiveMenu('admin-dash');
      } else if (activeMenu === 'clients-dash' && !hasPermission(user, 'clients:read')) {
        setActiveMenu('admin-dash');
      } else if (activeMenu === 'sites-dash' && !hasPermission(user, 'sites:read')) {
        setActiveMenu('admin-dash');
      } else if (activeMenu === 'admin-requests' && !hasPermission(user, 'requests:read')) {
        setActiveMenu('admin-dash');
      } else if (activeMenu === 'users-roles' || activeMenu === 'audit-logs' || activeMenu === 'company-settings') {
        setActiveMenu('admin-dash');
      }
    }
  }, [activeMenu, user]);

  // Loading fallback for SSR and first Client render (Guarantees matching HTML outputs)
  if (!hasMounted || !isAuthenticated || !user || (user.role !== 'SUPER_ADMIN' && user.role !== 'SUPERVISOR')) {
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
          setActiveMenu={setActiveMenu}
        />

        {/* Content Area */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto bg-white">
          {activeMenu === 'guards-dash' && hasPermission(user, 'guards:read') && <GuardManagement />}
          {activeMenu === 'clients-dash' && hasPermission(user, 'clients:read') && <ClientManagement />}
          {activeMenu === 'admin-requests' && hasPermission(user, 'requests:read') && <SiteRequestsManagement />}
          {activeMenu === 'sites-dash' && hasPermission(user, 'sites:read') && (
            <SiteManagement onNavigateToRequests={() => setActiveMenu('admin-requests')} />
          )}
          {activeMenu === 'audit-logs' && user.role === 'SUPER_ADMIN' && <AuditLogsManagement />}
          {activeMenu === 'users-roles' && user.role === 'SUPER_ADMIN' && <UsersRolesManagement />}
          {activeMenu === 'company-settings' && user.role === 'SUPER_ADMIN' && <AdminSettings />}
          {activeMenu === 'admin-dash' && (
            <div className="w-full flex flex-col gap-6">
              <div className="w-full bg-white border-2 border-black rounded-lg p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
                <div className="flex flex-col gap-2 max-w-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Fortress ASR Operations Command</span>
                  <h1 className="text-2xl font-black text-black">
                    Welcome, {user.firstName ? `${user.firstName} ${user.lastName}` : (user.role === 'SUPERVISOR' ? (user.staffProfile?.jobTitle || 'Operations Supervisor') : 'System Administrator')}
                  </h1>
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
                  <button
                    onClick={() => setActiveMenu('audit-logs')}
                    className="px-4 py-2.5 border-2 border-[#032031] bg-black/5 text-[#032031] text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-[#032031] hover:text-white transition cursor-pointer"
                  >
                    Audit Trail
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
