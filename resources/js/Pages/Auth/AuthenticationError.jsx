import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthShell from '@/Layouts/AuthShell';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function AuthenticationError() {
  return (
    <AuthShell
      title="Authentication problem"
      subtitle="System Authentication Error"
    >
      <Head title="Authentication Error - DMRS" />

      <div className="text-center py-4 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shadow-inner">
          <AlertTriangle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            We could not complete your authentication request due to a system communication issue. Please check your credentials or network connection and try again.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Link>

          <Link
            href="/login"
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
