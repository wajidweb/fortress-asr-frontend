import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Lock, Award } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-white py-12 lg:py-0 lg:min-h-[calc(100vh-80px)] overflow-hidden border-b border-slate-100 flex flex-col justify-center">
      
      {/* Soft Slate Micro Grid Dotted Background across the entire Hero section */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-60 z-0 pointer-events-none"></div>

      {/* Absolute Geometric Accent Gradients for deep high fidelity visual texture */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-slate-50 rounded-full filter blur-3xl opacity-60 z-0 translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#032031]/5 rounded-full filter blur-2xl opacity-40 z-0 -translate-x-10 translate-y-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Upper Grid Layout: Left visual + Right bold content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Brand Emblem Display & Compliance Status Banner */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Main Visual: Custom clipped frame representing secure fortress node with Next.js optimized Image */}
            <div 
              className="relative w-full aspect-[4/3] bg-slate-100 rounded-2xl shadow-xl overflow-hidden border border-slate-200/20 group"
              style={{ clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)' }}
            >
              <Image 
                src="/herosectionimage.jpeg" 
                alt="Fortress ASR Security Officer on escalators" 
                fill
                priority // Preloads above the fold image immediately to reduce LCP
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Adaptive resolution source mapping
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" 
              />
            </div>

            {/* Lower On site Compliance Ribbon */}
            <div className="relative bg-[#032031] text-white p-6 rounded-2xl flex items-center justify-between shadow-lg overflow-hidden border border-white/5">
              {/* Artistic Side Ribbon Cutouts */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-white rounded-r-md"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-white rounded-l-md"></div>
              
              <div className="pl-4 text-left">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#cba135]" />
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                    100%
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2 leading-none">
                  Fully Licensed SIA Guarding
                </p>
              </div>

              {/* Standard Page Link instead of state callback (Linked directly to /coming-soon for client inquiry) */}
              <Link 
                href="/coming-soon"
                className="w-11 h-11 bg-white text-[#032031] hover:bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl focus:outline-none"
                aria-label="Start Onboarding"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>

          {/* Right Column: Premium High Contrast Typography & CTA Buttons */}
          <div className="lg:col-span-7 flex flex-col space-y-8 relative text-left">
            
            {/* Small Upper Sub Heading Descriptor */}
            <div className="space-y-4">
              <div className="text-slate-600 text-xs font-bold uppercase tracking-widest">
                <span>Professional Guarding Services</span>
              </div>

              {/* Giant Uppercase Title matching image.png with zero dashes */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-slate-900 leading-[0.98] tracking-tighter">
                SECURE <br />
                YOUR PREMISES <br />
                <span className="text-[#032031]">WITH ELITE</span> <br />
                OFFICERS
              </h1>
            </div>

            {/* Clear Primary Copy Description sourced strictly from SOMS BRD/SRS with zero dashes */}
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
              Vigilance cannot be automated. Fortress ASR defends critical corporate, commercial, and residential environments with a disciplined force of licensed security officers. We are actively partnering with premium property owners who demand verified presence, and onboarding elite security guards who value strict compliance.
            </p>

            {/* CLEAR, PREMIUM ACTIONS & BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link 
                href="/register"
                className="px-8 py-4 bg-[#032031] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2.5"
              >
                <Lock className="w-4 h-4" />
                Register As Officer
              </Link>

              <Link 
                href="/coming-soon"
                className="px-8 py-4 bg-white border border-[#032031] text-[#032031] hover:bg-slate-50 font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                Hire Our Guards
              </Link>
            </div>

            {/* Circular floating rotating badge (Top-Right of titles) */}
            <div className="absolute right-0 top-0 hidden sm:flex flex-col items-center gap-3">
              <div className="relative w-24 h-24 bg-[#032031] rounded-full flex items-center justify-center shadow-lg border border-white/10 group cursor-pointer hover:scale-105 transition-transform duration-300">
                {/* Play symbol center */}
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[10px] border-l-[#032031] border-b-[5px] border-b-transparent translate-x-0.5"></div>
                </div>
                {/* Curved track text */}
                <svg className="absolute w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                  <path id="badgePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                  <text className="text-[5.5px] font-black uppercase fill-white tracking-widest">
                    <textPath href="#badgePath" startOffset="0%">
                      ELITE GUARDS • SECURE PROPERTIES • 
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
export default Hero;
