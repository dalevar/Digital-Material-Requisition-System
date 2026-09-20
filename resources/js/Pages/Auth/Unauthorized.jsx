import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthShell from '@/Layouts/AuthShell';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';

export default function Unauthorized() {
  return (
    <AuthShell
      title="Access denied"
      subtitle="403 Forbidden — Authorization Restricted"
    >
      <Head title="Access Denied - DMRS" />

      <div className="text-center py-4 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-700 border border-red-200 shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            You do not have the required authorization or role permission to access this resource. Please return to your assigned dashboard.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
