import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-6">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-black tracking-wider text-amber-500 sm:text-5xl uppercase">
          Fortress ASR
        </h1>
        <p className="text-lg text-slate-300 font-semibold mt-4">
          Security Operations Management System (SOMS)
        </p>
        <div className="w-16 h-1 bg-amber-500 mx-auto my-6 rounded"></div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Welcome to the Fortress ASR workspace. The frontend scaffolding is successfully prepared and ready for custom page development.
        </p>
      </div>
    </main>
  );
}
