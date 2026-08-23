'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export const Operations: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Refs to track the 3 vertical scrolling text blocks on the left side
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Expanded Core Operations Steps in simple, meaningful, and professional prose (With zero dashes)
  const steps = [
    {
      title: 'Rigorous Guard Vetting',
      description: 'Trust is the foundation of physical security. We make sure that every security officer assigned to your premises is fully qualified, vetted, and legally approved. Our internal operations database continuously monitors security guard licensing and work permits. If any guard permit is close to expiring, our system automatically pauses their shift allocation. This means you never have to worry about unvetted personnel protecting your property.',
      imageSrc: '/operations1.jpeg',
      imageAlt: 'ASR Vetted Security Officers Team',
    },
    {
      title: 'Verified On Site Presence',
      description: 'You deserve absolute proof that your property is being watched. We have replaced old paper log sheets with verified digital check ins. When our security guards arrive at your site, they must be physically inside a secure geofenced area. They check in by capturing a live camera photo selfie that matches our server timestamps. This gives property owners real time, undisputed evidence that our officers are active, on duty, and keeping your premises secure.',
      imageSrc: '/operations2.jpeg',
      imageAlt: 'ASR On Duty Guard using Radio Transceiver',
    },
    {
      title: 'Operational Continuity',
      description: 'Security lapses often happen when shifts change and guards rotate. We have solved this issue by locking shift transitions. Outgoing security officers log vital notes, master keyset transfers, and site occurrences into our digital Daily Occurrence Book. The incoming officer must read, verify, and digitally sign for these transition notes before they can start their shift. This seamless handover ensures that critical safety details are never lost.',
      imageSrc: '/operations3.jpeg',
      imageAlt: 'ASR Officer back shot on Escorts',
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Find the vertical center point of the viewport
      const viewportCenter = window.innerHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      // Detect which left-side text block is currently closest to the center of the viewport
      stepRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - elementCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });

      setActiveIndex(closestIndex);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial call to set active index on load
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="operations" className="relative bg-white py-20 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Centered Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-[#032031] font-bold text-xs uppercase tracking-widest leading-none block">
            Operational Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#032031] tracking-wide leading-none">
            Our Core Operations
          </h2>
          <div className="w-12 h-1 bg-[#032031] mx-auto rounded mt-3"></div>
        </div>

        {/* Dynamic Multi Column Layout: Left Column scrolls vertically | Right Column is sticky */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start relative">
          
          {/* LEFT SIDE: Natural Vertical Scrolling Text Column (Occupies 7/12 cols) */}
          <div className="md:col-span-7 flex flex-col space-y-16 lg:space-y-24 py-12 md:py-24">
            {steps.map((step, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className={`flex flex-col text-left space-y-4 transition-all duration-500 transform ${
                    isActive 
                      ? 'opacity-100 translate-x-2' // Subtle horizontal indent for active item
                      : 'opacity-30 translate-x-0'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-black text-xs transition-colors duration-500 leading-none ${
                      isActive ? 'bg-[#032031] text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      0{idx + 1}
                    </span>
                    <h3 className={`font-extrabold text-lg sm:text-xl uppercase tracking-wide leading-none transition-colors duration-500 ${
                      isActive ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className={`text-xs sm:text-sm font-semibold leading-relaxed max-w-lg transition-colors duration-500 ${
                    isActive ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE: Sticky Display Column (Occupies 5/12 cols) */}
          <div className="md:col-span-5 md:sticky md:top-[25vh] py-12 md:py-0 w-full z-20">
            {/* Aspect container displaying Next.js Optimized Images */}
            <div className="relative w-full aspect-[4/3] max-w-md mx-auto bg-slate-100 border border-slate-200 rounded-2xl shadow-xl overflow-hidden group">
              {steps.map((step, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-all duration-700 transform ${
                      isActive 
                        ? 'opacity-100 scale-100 rotate-0' 
                        : 'opacity-0 scale-95 rotate-1 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={step.imageSrc}
                      alt={step.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Dynamic Segment indicators directly below the sticky display card */}
            <div className="flex items-center justify-center gap-2.5 mt-6">
              {steps.map((_, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <div 
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isActive ? 'w-10 bg-[#032031]' : 'w-2 bg-slate-200'
                    }`}
                  />
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
export default Operations;
