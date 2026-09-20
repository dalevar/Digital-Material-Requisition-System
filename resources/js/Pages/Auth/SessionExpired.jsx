import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthShell from '@/Layouts/AuthShell';
import { Clock, Lock, LogIn } from 'lucide-react';

export default function SessionExpired() {
  return (
    <AuthShell
      title="Session expired"
      subtitle="Your active session has ended for security and data integrity reasons."
    >
      <Head title="Session Expired - DMRS" />

      <div className="text-center py-4 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shadow-inner">
          <Clock className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            You have been automatically signed out due to inactivity or session expiration. Please sign in again to resume your operational workflows.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
