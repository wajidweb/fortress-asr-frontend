'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Calendar, ShieldCheck, Map, Database } from 'lucide-react';

export const Workflow: React.FC = () => {
  // Restored all the 5 original operations steps (old content, with zero dashes)
  const steps = [
    {
      num: '1',
      icon: <Settings className="w-4 h-4 text-[#cba135]" />,
      title: 'Company Setup',
      subtitle: 'Structuring the Node',
      description: 'We onboard client profiles, map precise site coordinates, configure custom geofence parameters, and set up mandatory compliance rules.',
      // Custom coordinates on our expanded SVG grid (viewBox 0 0 1000 300)
      x: '100',
      y: '105',
      textStyle: 'absolute left-[2%] top-[45%] w-[16%] text-left space-y-1',
    },
    {
      num: '2',
      icon: <Calendar className="w-4 h-4 text-[#cba135]" />,
      title: 'Roster Planning',
      subtitle: 'Conflict Aware Rota',
      description: 'Supervisors schedule shifts using conflict aware planning systems. The database automatically suspends expired licences before dispatch.',
      x: '300',
      y: '195',
      textStyle: 'absolute left-[22%] top-[74%] w-[16%] text-left space-y-1',
    },
    {
      num: '3',
      icon: <ShieldCheck className="w-4 h-4 text-[#cba135]" />,
      title: 'Proof of Presence',
      subtitle: 'Geofenced Check In',
      description: 'Guards confirm their shifts four hours prior. Upon site arrival, they check in via geofenced photo selfies, locking precise timestamps.',
      x: '500',
      y: '105',
      textStyle: 'absolute left-[42%] top-[45%] w-[16%] text-left space-y-1',
    },
    {
      num: '4',
      icon: <Map className="w-4 h-4 text-[#cba135]" />,
      title: 'Vigilant Guarding',
      subtitle: 'NFC Patrol Routes',
      description: 'Officers perform patrol routes, scanning QR and NFC checkpoints. They log daily occurrences and report incidents in real time.',
      x: '700',
      y: '195',
      textStyle: 'absolute left-[62%] top-[74%] w-[16%] text-left space-y-1',
    },
    {
      num: '5',
      icon: <Database className="w-4 h-4 text-[#cba135]" />,
      title: 'Verified Timesheets',
      subtitle: 'Unalterable Archiving',
      description: 'After visual check out, verified logs feed into certified timesheets. Every transaction is archived in our unalterable seven year database.',
      x: '900',
      y: '105',
      textStyle: 'absolute right-[2%] top-[45%] w-[16%] text-left space-y-1',
    },
  ];

  return (
    <section className="relative bg-[#032031] py-20 border-b border-[#0f344d] overflow-hidden font-sans text-white">
      
      {/* Absolute background subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#011420] rounded-full filter blur-3xl opacity-60 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* ROW 1: Uppercut spacious Header & CTA row (Left text content + Right Action Button, reduced spacing, linked to /coming-soon for client onboarding) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10 text-left w-full">
          <div className="space-y-4 max-w-3xl">
            <span className="text-[#cba135] font-black text-[10px] uppercase tracking-widest leading-none block">
              OUR OPERATIONS LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight leading-[1.08] max-w-2xl">
              We Have The Best Guards & The Best Processes
            </h2>
            <p className="text-white text-xs sm:text-sm font-semibold leading-relaxed max-w-2xl">
              Fortress ASR manages on site security with absolute accountability. We believe that real world protection requires both elite personnel and disciplined operational systems. We coordinate every site patrol, shift check in, and daily occurrence log to ensure uncompromised safety.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link 
              href="/coming-soon" 
              className="inline-block px-8 py-4 bg-white text-[#032031] hover:bg-slate-100 font-bold text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* ROW 2: Giant Full-Width Wavy S-Curve Timeline with decreased top spacing */}
        <div className="relative w-full min-h-[440px] md:min-h-[480px]">
          
          {/* Desktop Version: Full-Width S-Curve SVG Timeline (Visible on large screens) */}
          <div className="hidden lg:block absolute inset-0 w-full h-full">
            
            {/* Seamless 5-Node S-Curve Wave Line SVG in Gold (#cba135) for high-contrast on Dark-Teal background */}
            <svg className="absolute w-full h-full" viewBox="0 0 1000 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Wavy Gold path crossing 5 peaks and troughs over 1000px span */}
              <path 
                d="M 10 150 C 120 40, 180 260, 290 195 C 400 130, 410 40, 490 105 C 570 170, 610 260, 690 195 C 770 130, 810 40, 890 105 C 930 140, 950 180, 990 150" 
                stroke="#cba135" // Fortress Gold for high-fidelity contrast
                strokeWidth="2.5" 
                strokeLinecap="round"
                className="drop-shadow-[0_2px_4px_rgba(203,161,53,0.15)]"
              />
              
              {/* Interactive Node Bullets with Gold highlights along the path */}
              {steps.map((step) => (
                <g key={step.num}>
                  {/* Shadow Backing Circle */}
                  <circle cx={step.x} cy={step.y} r="11" fill="white" className="filter drop-shadow-md" />
                  {/* Gold Outer Border Ring */}
                  <circle cx={step.x} cy={step.y} r="8" fill="white" stroke="#032031" strokeWidth="2.2" />
                  {/* Core Brand Dark Center Dot */}
                  <circle cx={step.x} cy={step.y} r="4" fill="#cba135" />
                </g>
              ))}
            </svg>

            {/* 5 Step Descriptions absolutely-positioned along the curves with solid white text */}
            {steps.map((step) => (
              <div key={step.num} className={step.textStyle}>
                {/* Oversized Translucent Background Number in faint semi-transparent white */}
                <span className="absolute -left-3 -top-8 text-6xl font-black text-white/5 select-none -z-10">
                  {step.num}
                </span>
                
                {/* Step Content */}
                <div className="flex items-center gap-1.5">
                  <span className="p-1 bg-white/10 rounded border border-white/20">{step.icon}</span>
                  <h4 className="font-extrabold text-[11px] text-white uppercase tracking-wide leading-none">
                    {step.title}
                  </h4>
                </div>
                
                {step.subtitle && (
                  <span className="text-[8.5px] text-[#cba135] font-black uppercase tracking-wider block mt-1 leading-none pl-6">
                    {step.subtitle}
                  </span>
                )}
                
                <p className="text-[9.5px] text-white font-semibold leading-relaxed pt-2 pl-6">
                  {step.description}
                </p>
              </div>
            ))}

          </div>

          {/* Mobile Version: Compact Vertical 5-Step Timeline (Visible on mobile/tablet) */}
          <div className="lg:hidden flex flex-col space-y-10 pl-6 border-l border-white/10 py-6 text-left">
            {steps.map((step) => (
              <div key={step.num} className="relative space-y-2">
                {/* Mobile Indicator node */}
                <div className="absolute -left-[31px] top-0 p-1 bg-[#032031] border border-white/15 rounded-full">
                  <div className="w-2.5 h-2.5 bg-[#cba135] rounded-full"></div>
                </div>
                {/* Translucent background number */}
                <span className="absolute -left-4 -top-6 text-5xl font-black text-white/5 select-none -z-10">
                  {step.num}
                </span>
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-white/10 rounded border border-white/20">{step.icon}</span>
                  <h4 className="font-extrabold text-sm text-white uppercase tracking-wide leading-none">
                    {step.title}
                  </h4>
                </div>
                {step.subtitle && (
                  <span className="text-[9px] text-[#cba135] font-black uppercase tracking-wider block leading-none pl-7">
                    {step.subtitle}
                  </span>
                )}
                <p className="text-xs text-white font-semibold leading-relaxed pt-1 pl-7">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
export default Workflow;
