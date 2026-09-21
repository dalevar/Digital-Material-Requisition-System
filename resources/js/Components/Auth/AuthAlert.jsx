import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AuthAlert({ type = 'error', message, title, className = '' }) {
  if (!message && !title) return null;

  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />,
      titleColor: 'text-red-900 font-semibold',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-900 font-semibold',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
      titleColor: 'text-emerald-900 font-semibold',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
      titleColor: 'text-blue-900 font-semibold',
    },
  }[type];

  return (
    <div className={`p-3.5 rounded-md border text-xs leading-relaxed flex items-start gap-3 ${styles.bg} ${className}`} role="alert">
      {styles.icon}
      <div className="space-y-0.5">
        {title && <div className={styles.titleColor}>{title}</div>}
        {message && <div className="text-slate-700">{message}</div>}
      </div>
    </div>
  );
}
