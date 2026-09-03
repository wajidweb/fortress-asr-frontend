'use client';

import { useEffect } from 'react';
import { useUIStore, ToastMessage } from '@/store/useUIStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function ToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useUIStore((state) => state.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  const config = {
    success: {
      borderColor: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      labelColor: 'text-emerald-400',
      title: 'Success',
    },
    error: {
      borderColor: 'border-rose-500/30',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
      labelColor: 'text-rose-400',
      title: 'Error',
    },
    info: {
      borderColor: 'border-blue-500/30',
      icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
      labelColor: 'text-blue-400',
      title: 'Notification',
    },
  };

  const { borderColor, icon, labelColor, title } = config[toast.type] || config.info;

  return (
    <div
      className={`pointer-events-auto flex items-start justify-between gap-2.5 px-3 py-2 bg-[#02121E]/95 text-white border rounded-lg shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 opacity-100 hover:scale-[1.01] max-w-[280px] w-full ${borderColor}`}
    >
      <div className="flex items-start gap-2 min-w-0">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="flex flex-col min-w-0 gap-0.5">
          <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${labelColor}`}>
            {title}
          </span>
          <span className="text-[11px] font-semibold text-white/90 leading-tight">
            {toast.message}
          </span>
        </div>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white/40 hover:text-white hover:bg-white/10 p-0.5 rounded transition shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function Toaster() {
  const toasts = useUIStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 max-w-[280px] w-full pointer-events-none select-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
