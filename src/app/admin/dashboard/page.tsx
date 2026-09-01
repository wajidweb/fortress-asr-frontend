'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import Sidebar from './Sidebar';
import Header from './Header';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import GuardManagement from './GuardManagement';

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
    <div className="flex h-screen w-full bg-white text-black overflow-hidden font-sans antialiased relative">
      
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

        {/* Empty Page Layout Canvas Container (Content Area) */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto bg-slate-50/50">
          {activeMenu === 'guards-dash' ? <GuardManagement /> : null}
        </main>
      </div>

    </div>
  );
}
