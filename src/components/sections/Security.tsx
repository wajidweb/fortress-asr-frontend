import React from 'react';
import Link from 'next/link';

export const Security: React.FC = () => {
  return (
    <section className="relative bg-white py-16 lg:py-20 overflow-hidden font-sans border-b border-slate-100 flex flex-col justify-center">
      
      {/* Soft Slate Micro Grid Dotted Background across the entire section (Matches Hero background) */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-60 z-0 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10 w-full">
        
        {/* Spacious, Bold Typography Header (No yellow color used, completely dash-free) */}
        <div className="space-y-4">
          <span className="text-[#032031] font-black text-xs uppercase tracking-widest leading-none block">
            Partner With Fortress ASR
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#032031] tracking-tight leading-none">
            Secure Your Premises Today
          </h2>
          <div className="w-12 h-1 bg-[#032031] mx-auto rounded"></div>
        </div>

        {/* Copywriter-driven body prose directed at both Clients and Guards (Zero dashes!) */}
        <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed max-w-2xl mx-auto">
          Whether you are a commercial property partner seeking elite, SIA licensed officer protection for your corporate locations or a qualified security guard looking to onboard with our premium team, we are ready to connect. Register with us today to experience absolute on site accountability, geofenced presence verification, and uncompromised safety.
        </p>

        {/* Long, spacious Call-To-Action buttons with whitespace-nowrap preventing any text line-breaks */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
          <Link 
            href="/register/guard"
            className="inline-flex justify-center items-center min-w-[220px] px-8 py-4 bg-[#032031] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
          >
            Onboard As Officer
          </Link>

          <Link 
            href="/coming-soon"
            className="inline-flex justify-center items-center min-w-[220px] px-8 py-4 bg-white border border-[#032031] text-[#032031] hover:bg-slate-50 font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 whitespace-nowrap"
          >
            Hire Our Guards
          </Link>
        </div>

      </div>
    </section>
  );
};
export default Security;
