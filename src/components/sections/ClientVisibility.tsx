import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const ClientVisibility: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const highlights = [
    {
      num: '01',
      title: 'Live Presence',
      description: 'View the active duty status and verified coordinates of our security officers on your properties instantly.',
    },
    {
      num: '02',
      title: 'Verified Patrols',
      description: 'Monitor completed checkpoint scans, timing statistics, and patrol path evidence on our live ledger.',
    },
    {
      num: '03',
      title: 'Incident Logs',
      description: 'Receive immediate access to published incident reports including logged photos, voice notes, and actions.',
    },
    {
      num: '04',
      title: 'Isolated Security',
      description: 'Protect contract records through unique client slug routes and strict server side database isolation.',
    },
  ];

  return (
    <section className="relative bg-white py-12 border-b border-slate-100 overflow-hidden font-sans">
      
      {/* Absolute background subtle glow */}
      <div className="absolute top-1/2 right-3/4 w-[350px] h-[300px] bg-slate-50 rounded-full filter blur-3xl opacity-40 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Upper Grid Layout: Left Content Column + Right Rounded Image Frame (Exact Match to image copy 2.png, reduced spacing) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pb-10">
          
          {/* Left Column: Typography, Copy, and Custom Capsule Button (Occupies 7/12 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <span className="text-[#032031] font-black text-xs uppercase tracking-widest leading-none block">
              Why Partner With Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black uppercase text-[#032031] tracking-wide leading-tight">
              Client Visibility <br />
              You Can Trust
            </h2>
            <div className="w-12 h-1 bg-[#032031] rounded"></div>
            
            <p className="text-slate-500 text-sm font-semibold leading-relaxed max-w-xl">
              We believe that premium property protection is built on total transparency. Fortress ASR provides your organization with secure, real time visibility into our guarding services. Through our isolated client web portal, you can monitor live officer active states, review verified checkpoint patrols, and inspect published incident logs for your contracted locations, giving you absolute confidence that your sites are actively defended.
            </p>

            {/* Custom Capsule Button matching the exact design and shape of 'Book an appointment' */}
            <div className="pt-2">
              <Link 
                href="#register" 
                className="inline-flex items-center justify-between gap-6 pl-6 pr-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#032031] font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm"
              >
                <span>Request Portal Access</span>
                <div className="p-2.5 bg-[#032031] text-white rounded-full">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Rounded Image container (Occupies 5/12 cols) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-md aspect-[4/5] bg-slate-50 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200/40 group">
              <Image 
                src="/operations3.jpeg" 
                alt="ASR Professional Security Officer patrolling" 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </div>

        </div>

        {/* Lower Grid Layout: Clean Horizontal Highlights with top border line matching image copy 2.png, reduced padding */}
        <div className="w-full border-t border-slate-200 pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {highlights.map((item) => (
            <div key={item.num} className="flex flex-col space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#032031] text-white text-xs font-black leading-none">
                  {item.num}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide leading-none">
                  {item.title}
                </h4>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed pl-1.5">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
export default ClientVisibility;
