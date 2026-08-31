'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { Shield, Calendar, CheckSquare, Compass, LogOut } from 'lucide-react';
import LoaderRectangle from '@/components/ui/LoaderRectangle';

export default function GuardDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Hydration guard state
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      if (!isAuthenticated || !user || user.role !== 'GUARD') {
        router.push('/login');
      }
    }
  }, [hasMounted, isAuthenticated, user, router]);

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

  return (
    <div className="min-h-screen bg-[#032031] text-white font-sans flex flex-col justify-between">
      
      {/* Top Header Row with brand colors */}
      <div className="border-b border-white/10 py-6 px-6 sm:px-12 bg-[#02141F]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <div className="flex flex-col">
              <span className="text-[10px] text-white/70 font-black tracking-widest uppercase">Guard Mobile Terminal Console</span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Guard Dashboard</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#032031] hover:bg-black hover:text-white font-black text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-md"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Stats and Site Lists */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 flex-grow w-full flex flex-col gap-8">
        
        {/* Welcome Guard Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-1.5">
          <span className="text-xs text-white/50 font-black uppercase tracking-wider">Active SIA Licensed Officer</span>
          <h2 className="text-2xl font-black">Welcome Back, Officer {user.firstName} {user.lastName}</h2>
          <p className="text-xs text-white/70 font-semibold leading-relaxed max-w-xl">
            You are logged into your mobile terminal console. Review your current schedules, assigned site checkpoints, and submit secure incident audits.
          </p>
        </div>

        {/* Guard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shift Schedule */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50 font-black uppercase tracking-wider">Assigned Rota Shifts</span>
              <span className="text-4xl font-black">5</span>
            </div>
            <Calendar className="w-10 h-10 text-white/20" />
          </div>

          {/* Completed Patrols */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50 font-black uppercase tracking-wider">Completed Patrols</span>
              <span className="text-4xl font-black">18</span>
            </div>
            <CheckSquare className="w-10 h-10 text-white/20" />
          </div>

          {/* Verification compliance */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/50 font-black uppercase tracking-wider">GPS Checked Tasks</span>
              <span className="text-4xl font-black">24</span>
            </div>
            <Compass className="w-10 h-10 text-white/20" />
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-white/5 py-4 text-center text-[10px] text-white/30 font-black tracking-wider uppercase bg-[#01090f]">
        Fortress ASR Security Command.
      </div>

    </div>
  );
}
