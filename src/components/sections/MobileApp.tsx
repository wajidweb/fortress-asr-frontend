import React from 'react';
import { Smartphone, Play, Apple } from 'lucide-react';

export const MobileApp: React.FC = () => {
  return (
    <section className="relative bg-white py-20 border-b border-slate-100 overflow-hidden font-sans">
      
      {/* Absolute background subtle glow */}
      <div className="absolute top-1/2 left-2/3 w-[400px] h-[400px] bg-slate-50 rounded-full filter blur-3xl opacity-60 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Split Grid Layout mirroring the exact composition of image copy.png */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Bold Copy & Store Badges (Occupies 7/12 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black uppercase text-[#032031] tracking-wide leading-tight">
              Ready To Track Operations In Real Time?
            </h2>
            <div className="w-12 h-1 bg-[#032031] rounded"></div>
            
            {/* Extended, professional copywriting sourced from SRS with zero dashes */}
            <p className="text-slate-500 text-sm font-semibold leading-relaxed max-w-xl">
              Vigilance requires reliable field connections. While our custom mobile application is currently in active development, it will serve as the primary operational link for our security officers on duty. Our guards will use this application to confirm upcoming rosters four hours in advance, perform secure geofenced check ins with mandatory live camera verification, scan QR and NFC checkpoints, and log site occurrences in our digital Daily Occurrence Book. In emergencies, a persistent panic button will instantly stream live locations to our supervisor command center.
            </p>

            {/* High Fidelity App Store & Google Play CSS Badges Row */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              
              {/* Google Play CSS Badge */}
              <div className="flex items-center gap-3 bg-black text-white px-4 py-2.5 rounded-xl border border-white/10 shadow-md cursor-not-allowed select-none">
                <Play className="w-5 h-5 fill-white text-white" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-none">Get it on</span>
                  <span className="text-xs font-bold text-white mt-1 leading-none">Google Play</span>
                </div>
              </div>

              {/* App Store CSS Badge */}
              <div className="flex items-center gap-3 bg-black text-white px-4 py-2.5 rounded-xl border border-white/10 shadow-md cursor-not-allowed select-none">
                <Apple className="w-5.5 h-5.5 fill-white text-white" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-none">Download on the</span>
                  <span className="text-xs font-bold text-white mt-1 leading-none">App Store</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Premium iPhone Mockup with Coming Soon Overlay (Occupies 5/12 cols) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            
            {/* Elegant iPhone frame container matching image copy.png */}
            <div className="relative w-64 sm:w-72 aspect-[9/19] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col justify-between overflow-hidden">
              
              {/* Dynamic Island Notch */}
              <div className="w-28 h-5 bg-black rounded-full absolute top-3.5 left-1/2 -translate-x-1/2 z-30"></div>
              
              {/* Top Notch Status Indicators */}
              <div className="flex justify-between items-center px-5 pt-3.5 text-white/40 text-[9px] font-black z-20 select-none">
                <span>9:41 AM</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span>Battery</span>
                </div>
              </div>

              {/* Mobile Screen: Centered Glowing "Coming Soon" Canvas */}
              <div className="flex-grow flex flex-col justify-between p-6 bg-gradient-to-br from-[#032031] to-[#011420] rounded-[36px] overflow-hidden relative z-10 border border-white/5">
                {/* Micro dots background */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none"></div>
                
                {/* Header title */}
                <div className="text-left pt-6 space-y-1">
                  <span className="text-[9px] text-[#cba135] font-black uppercase tracking-widest leading-none">Fortress Security</span>
                  <h4 className="text-white text-base font-extrabold leading-tight uppercase">Guard On Duty</h4>
                </div>

                {/* Central COMING SOON Banner */}
                <div className="flex flex-col items-center justify-center space-y-4 py-8 relative">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-16 w-16 rounded-full bg-white/5 animate-ping"></span>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                      <Smartphone className="w-8 h-8 text-[#cba135]" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-white text-lg font-black uppercase tracking-wider leading-none">
                      Coming Soon
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                      Development Phase
                    </p>
                  </div>
                </div>

                {/* Bottom descriptor */}
                <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[8px] text-white/40 font-bold uppercase tracking-wider">
                  <span>Mobile Node</span>
                  <span>SOMS App v1.0</span>
                </div>

              </div>

              {/* Virtual Home Bar Indicator at the bottom */}
              <div className="h-1 w-28 bg-white/30 rounded-full mx-auto mb-2 relative z-20"></div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
export default MobileApp;
