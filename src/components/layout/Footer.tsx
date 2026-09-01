import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#032031] border-t border-white/10 pt-16 pb-8 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper Footer: Focused grid mapping available resources only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand & Logo */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image 
                  src="/logo.png" 
                  alt="Fortress ASR" 
                  fill 
                  sizes="32px"
                  className="object-contain rounded"
                />
              </div>
              <span className="font-black tracking-wider uppercase text-base text-white">
                Fortress ASR
              </span>
            </div>
            <p className="text-xs text-white leading-relaxed font-medium">
              Professional Security Operations Management System. Enforcing compliance, active 
              geofenced attendance, and real-time command center transparency.
            </p>
          </div>

          {/* Column 2: Only Active / Available Navigation Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">
              Navigation
            </h4>
            <div className="flex flex-col gap-3 text-xs text-white font-semibold">
              <Link href="/" className="hover:underline transition-all">Overview</Link>
              <Link href="#register" className="hover:underline transition-all">Guard Registration</Link>
            </div>
          </div>

          {/* Column 3: Social Media & Connect (LinkedIn First, then Twitter) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">
              Secure Connect
            </h4>
            <p className="text-xs text-white leading-relaxed font-medium">
              Connect with Fortress ASR channels for official operations updates and services.
            </p>
            {/* Social Icons row in solid white */}
            <div className="flex items-center gap-4 mt-1">
              <Link 
                href="https://linkedin.com" 
                target="_blank" 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link 
                href="https://twitter.com" 
                target="_blank" 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
              >
                <Twitter className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Lower Footer: Copyright & Developer Mention */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left pt-8">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] text-white font-black tracking-wider uppercase leading-none">
              © {currentYear} FORTRESS ASR. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Developer Credit aligned right */}
          <div className="text-xs text-white font-bold tracking-wide">
            Developed by{' '}
            <Link 
              href="https://www.linkedin.com/in/wajid-ali-khan-364bb9220/" 
              target="_blank" 
              className="text-white hover:underline font-black decoration-white decoration-2 underline-offset-4 transition-all"
            >
              Wajid Ali Khan
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
export default Footer;
