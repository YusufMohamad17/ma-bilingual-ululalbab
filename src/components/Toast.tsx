import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-md shadow-lg border animate-fade-in text-sm ${
        type === 'success' 
          ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
          : 'bg-rose-50 border-rose-250 text-rose-800'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
      )}
      <span className="font-medium">{message}</span>
      <button 
        type="button" 
        onClick={onClose} 
        className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 shrink-0"
        aria-label="Tutup"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
