'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { Shield, MapPin, Eye, LogOut, CheckCircle2 } from 'lucide-react';
import LoaderRectangle from '@/components/ui/LoaderRectangle';

export default function ClientDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Hydration guard state
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      if (!isAuthenticated || !user || user.role !== 'CLIENT') {
        router.push('/login');
      }
    }
  }, [hasMounted, isAuthenticated, user, router]);

  if (!hasMounted || !isAuthenticated || !user || user.role !== 'CLIENT') {
    return (
      <div className="min-h-screen bg-white flex flex-col gap-5 items-center justify-center text-[#032031] font-black text-sm uppercase tracking-wider select-none">
        <LoaderRectangle />
        <span>Verifying Client Portal Access...</span>
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
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      
      {/* Top Header Row with brand colors */}
      <div className="border-b border-black/10 py-6 px-6 sm:px-12 bg-[#032031] text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <div className="flex flex-col">
              <span className="text-[10px] text-white/70 font-black tracking-widest uppercase">Corporate Portal Access</span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Client Portal</h1>
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
        
        {/* Welcome Client Card */}
        <div className="bg-slate-50 border border-black/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-1.5">
          <span className="text-xs text-slate-500 font-black uppercase tracking-wider">Verified Business Partner</span>
          <h2 className="text-2xl font-black text-[#032031]">Welcome Back, {user.firstName} {user.lastName}</h2>
          <p className="text-xs text-black font-semibold leading-relaxed max-w-xl">
            Review patrols, active guards, and occurrence books assigned to your secure sites in real time.
          </p>
        </div>

        {/* Client Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sites */}
          <div className="bg-white border border-black p-6 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 font-black uppercase tracking-wider">Your Monitored Sites</span>
              <span className="text-4xl font-black text-[#032031]">3</span>
            </div>
            <MapPin className="w-10 h-10 text-[#032031]/20" />
          </div>

          {/* Officers on duty */}
          <div className="bg-white border border-black p-6 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 font-black uppercase tracking-wider">Officers On Duty</span>
              <span className="text-4xl font-black text-[#032031]">8</span>
            </div>
            <Eye className="w-10 h-10 text-[#032031]/20" />
          </div>

          {/* Patrol completeness */}
          <div className="bg-white border border-black p-6 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 font-black uppercase tracking-wider">Patrol Compliance</span>
              <span className="text-4xl font-black text-[#032031]">98.4%</span>
            </div>
            <CheckCircle2 className="w-10 h-10 text-[#032031]/20" />
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-black/10 py-4 text-center text-[10px] text-slate-500 font-black tracking-wider uppercase bg-slate-50">
        Fortress ASR Security Command.
      </div>

    </div>
  );
}
