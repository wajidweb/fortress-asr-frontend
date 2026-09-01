'use client';

import React from 'react';

// 1. My Shifts Panel Component
export const MyShifts: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px]">
      Officer Terminal Operations Workspace
    </div>
  );
};

// 2. Shift Check In Panel Component
export const ShiftCheckIn: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px]">
      Shift Check In Console
    </div>
  );
};

// 3. Schedules Rota Panel Component
export const SchedulesRota: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px]">
      Schedules Rota Calendar
    </div>
  );
};

// 4. Patrol Terminal Panel Component
export const PatrolTerminal: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px]">
      Patrol Scan Terminal
    </div>
  );
};

// 5. Occurrence Book Panel Component
export const OccurrenceBook: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px]">
      Digital Occurrence Book (DOB) Logs
    </div>
  );
};

// 6. Incident Reports Panel Component
export const IncidentReports: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px]">
      Incident Incident Reports Console
    </div>
  );
};

// 7. Welfare Checks Panel Component
export const WelfareChecks: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px]">
      Welfare Safety Checks Timer
    </div>
  );
};

// 8. Site Instructions Panel Component
export const SiteInstructions: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 text-slate-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px]">
      Site Emergency Instructions & Procedures
    </div>
  );
};

// 9. Panic Alert Panel Component
export const PanicAlert: React.FC = () => {
  return (
    <div className="w-full h-full border-2 border-dashed border-red-200 rounded-2xl flex items-center justify-center p-12 text-red-400 select-none text-[10px] font-black uppercase tracking-wider min-h-[300px] bg-red-50/10">
      Emergency Panic Alert Trigger Console
    </div>
  );
};
