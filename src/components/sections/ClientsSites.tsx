import React from 'react';
import Image from 'next/image';
import { Lock } from 'lucide-react';

interface ClientsSitesProps {
  onStartRegistration?: () => void;
}

export const ClientsSites: React.FC<ClientsSitesProps> = ({ onStartRegistration }) => {
  const handleRegisterClick = (e: React.MouseEvent) => {
    if (onStartRegistration) {
      e.preventDefault();
      onStartRegistration();
    }
  };

  return (
    <section className="relative bg-white py-12 lg:py-0 lg:min-h-[calc(100vh-80px)] overflow-hidden border-b border-slate-100 flex flex-col justify-center font-sans">
      
      {/* Soft Slate Micro Grid Dotted Background across the entire section */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-60 z-0 pointer-events-none"></div>

      {/* Absolute Geometric Accent Gradients for deep high fidelity visual texture */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-slate-50 rounded-full filter blur-3xl opacity-60 z-0 translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#032031]/5 rounded-full filter blur-2xl opacity-40 z-0 -translate-x-10 translate-y-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Upper Grid Layout: Left visual + Right bold content (Exact Mirror of Hero Section Layout, enlarged image) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Brand Emblem Display (Enlarged aspect ratio, new operations image) */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Main Visual: Custom clipped frame representing secure fortress node with Next.js optimized Image (Enlarged to 1:1 aspect-square) */}
            <div 
              className="relative w-full aspect-square max-w-[400px] mx-auto bg-slate-100 rounded-2xl shadow-xl overflow-hidden border border-slate-200/20 group"
              style={{ clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)' }}
            >
              <Image 
                src="/operations2.jpeg" 
                alt="Fortress ASR Security Site Guarding" 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Adaptive resolution source mapping
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" 
              />
            </div>

          </div>

          {/* Right Column: Premium High Contrast Typography & CTA Buttons (Floating rotating badge removed) */}
          <div className="lg:col-span-7 flex flex-col space-y-8 relative text-left">
            
            {/* Small Upper Sub Heading Descriptor */}
            <div className="space-y-4">
              <div className="text-slate-600 text-xs font-bold uppercase tracking-widest">
                <span>Corporate & Commercial Properties</span>
              </div>

              {/* Giant Uppercase Title matching image.png with zero dashes */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-slate-900 leading-[0.98] tracking-tighter">
                SECURE <br />
                YOUR PREMISES <br />
                <span className="text-[#032031]">WITH ABSOLUTE</span> <br />
                ACCOUNTABILITY
              </h1>
            </div>

            {/* Clear Primary Copy Description sourced strictly from SOMS BRD/SRS with zero dashes */}
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
              Every property requires customized protection. We manage unique client portfolios, secure locations, and site instructions with total accuracy. From setting up precise geofence boundaries to coordinating specific guard requirements, we organize your site details in our central operations dashboard. This allows our supervisors to dispatch officers according to your exact requirements and gives property owners uncompromised visibility into their active security services.
            </p>

            {/* CLEAR, PREMIUM ACTIONS & BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button 
                onClick={handleRegisterClick}
                className="px-8 py-4 bg-[#032031] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2.5"
              >
                <Lock className="w-4 h-4" />
                Register Client Site
              </button>

              <button 
                onClick={handleRegisterClick}
                className="px-8 py-4 bg-white border border-[#032031] text-[#032031] hover:bg-slate-50 font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                Hire Our Guards
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
export default ClientsSites;
