import React from 'react';
import Image from 'next/image';

export const DailyOps: React.FC = () => {
  const operations = [
    {
      title: 'Active Patrols',
      description: 'We secure your site perimeter with active patrol routes. Our officers scan QR and NFC checkpoints, instantly logging GPS locations and timestamps directly to our central command server. This creates reliable digital evidence that every sector of your property is actively watched and secure.',
      imageSrc: '/operations1.jpeg',
      imageAlt: 'Active Patrol Route Verification',
    },
    {
      title: 'Secure Check Ins',
      description: 'Trust is built on verified presence. We have replaced manual roll calls with geofence validated check ins. Our security guards must be physically inside your site boundary to clock in, backed by mandatory live camera photo selfies that block gallery uploads.',
      imageSrc: '/operations2.jpeg',
      imageAlt: 'Geofenced Check In Verification',
    },
    {
      title: 'Incident Desk',
      description: 'We manage on site occurrences with absolute accountability. Our guards log daily events and transition notes in our digital Daily Occurrence Book. Any security incident is instantly reported with voice notes and photos, triggering immediate supervisor alerts.',
      imageSrc: '/operations3.jpeg',
      imageAlt: 'Incident Desk and Handover Logs',
    },
  ];

  return (
    <section className="relative bg-[#032031] py-20 border-b border-[#0f344d] overflow-hidden font-sans text-white">
      
      {/* Absolute background subtle glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#011420] rounded-full filter blur-3xl opacity-60 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Top Header Section matching the image.png styling, completely dash-free */}
        <div className="max-w-3xl text-left space-y-4 mb-16">
          <span className="text-white/60 font-black text-xs uppercase tracking-widest leading-none block">
            Daily Operations
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-none">
            Unified Day To Day <br className="hidden sm:block" />
            Security Management
          </h2>
          <p className="text-slate-300 font-semibold text-xs sm:text-sm max-w-xl leading-relaxed pt-1">
            We coordinate our complete physical security operations, on site patrols, and daily incident responses through one centralized system of record.
          </p>
        </div>

        {/* 3 Column Interactive Card Grid matching image.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {operations.map((item, idx) => {
            return (
              <div 
                key={idx}
                className="group relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/5 cursor-pointer"
              >
                
                {/* Background Next.js Optimized Image */}
                <Image 
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />

                {/* Dark Gradient Overlay - Fades in even more on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-10"></div>
                
                {/* Micro dots background mesh inside cards */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none z-15"></div>

                {/* Card Content Column - Fixed on bottom-left, text slides up on hover */}
                <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end text-left h-full">
                  
                  {/* Default State: Title always visible at bottom */}
                  <h3 className="text-white text-xl font-black uppercase tracking-wide leading-none group-hover:translate-y-[-10px] transition-transform duration-500">
                    {item.title}
                  </h3>

                  {/* Hover State Container: Slides up and fades in */}
                  <div className="max-h-0 group-hover:max-h-56 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden mt-2">
                    <p className="text-[10px] sm:text-xs text-slate-300 font-semibold leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
export default DailyOps;
