import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const Guards: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <section className="relative bg-[#032031] py-20 border-b border-[#0f344d] overflow-hidden font-sans text-white">
      
      {/* Swooping dotted arc line with a gliding security shield badge across the dark background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full opacity-40" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M -100,250 C 300,550 1100,500 1540,150" 
            stroke="rgba(255, 255, 255, 0.15)" 
            strokeWidth="1.5" 
            strokeDasharray="6 6" 
          />
          {/* Gliding security shield badge at the center of the arc in Gold and Dark Teal */}
          <g transform="translate(620, 440) rotate(12) scale(0.8)">
            <path 
              d="M 12 22 C 12 22 20 18 20 12 L 20 5 L 12 2 L 4 5 L 4 12 C 4 18 12 22 12 22 Z" 
              fill="#032031" 
              stroke="#cba135" 
              strokeWidth="2" 
            />
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Upper Grid Layout: Left Content Column + Right Overlapping Image Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pb-20">
          
          {/* Left Column: Bold Typography & Sourced Copywrite Story (Occupies 7/12 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black uppercase text-white tracking-wide leading-tight">
              Our Security Forces
            </h2>
            <div className="w-12 h-1 bg-[#cba135] rounded"></div>
            
            <p className="text-slate-200 text-sm font-semibold leading-relaxed max-w-xl">
              At Fortress ASR, we believe that real world physical protection is built on absolute trust and active vigilance. We maintain a highly disciplined, fully vetted, and professionally trained force of SIA licensed security officers. Every officer is handpicked, undergoes strict background screening, and is continuously audited for licensing and right to work status.
            </p>
            
            <p className="text-slate-200 text-sm font-semibold leading-relaxed max-w-xl">
              Through geofenced tracking, live check in photo verification, and digital daily occurrence books, our officers remain fully accountable, responsive, and connected on every shift. We protect your properties through active, disciplined presence.
            </p>

            {/* Dual CTA Buttons - Structured for both prospective Guards and Clients */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
              <Link 
                href="#register" 
                className="inline-flex justify-center items-center px-7 py-3.5 bg-white text-[#032031] hover:bg-slate-100 font-bold text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                Register As Officer
              </Link>

              <Link 
                href="#register" 
                className="inline-flex justify-center items-center px-7 py-3.5 bg-transparent border border-white text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300"
              >
                Hire Our Guards
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Overlapping Image Collage (Occupies 5/12 cols) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end min-h-[380px] sm:min-h-[440px] w-full">
            
            {/* Back Image Card: Vetted Security Team */}
            <div className="absolute top-4 left-4 lg:left-0 w-[75%] aspect-square bg-[#011420] rounded-2xl overflow-hidden shadow-lg border border-slate-200/10 z-10 transition-transform duration-500 hover:scale-[1.02]">
              <Image 
                src="/operations1.jpeg" 
                alt="ASR Deployed Vetted Team" 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>

            {/* Front Overlapping Image Card: Rotated and skewed for premium depth */}
            <div className="absolute bottom-4 right-4 lg:right-0 w-[62%] aspect-square bg-[#011420] rounded-2xl overflow-hidden shadow-2xl border-2 border-white z-20 transform rotate-[6deg] translate-y-6 transition-all duration-500 hover:scale-[1.05] hover:rotate-[2deg]">
              <Image 
                src="/operations3.jpeg" 
                alt="ASR Security Officer On Duty" 
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
            </div>

          </div>

        </div>

        {/* Lower Grid Layout: Clean Horizontal Operations Guarantees & Features (No numbers) */}
        <div className="w-full border-t border-white/10 pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
          
          {/* Guarantee 1 */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#cba135]">
              SIA Certified
            </h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Every officer on our force is fully licensed by the Security Industry Authority and holds verified Right to Work status.
            </p>
          </div>

          {/* Guarantee 2 */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#cba135]">
              Geofence Tracked
            </h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Complete proof of presence using real time GPS boundary locks and mandatory live camera check in verification.
            </p>
          </div>

          {/* Guarantee 3 */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#cba135]">
              Continuous Handover
            </h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Seamless shift transitions with locked digital handovers and active Daily Occurrence Book logging.
            </p>
          </div>

          {/* Guarantee 4 */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#cba135]">
              Incident Alerting
            </h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Instant incident logging with multimedia uploads, GPS locking, and automated supervisor dispatch routes.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
export default Guards;
