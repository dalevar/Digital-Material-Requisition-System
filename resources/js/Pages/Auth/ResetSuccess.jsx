import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthShell from '@/Layouts/AuthShell';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ResetSuccess() {
  return (
    <AuthShell
      title="Password updated"
      subtitle="Your account security credentials have been updated."
    >
      <Head title="Password Updated - DMRS" />

      <div className="text-center py-4 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your password has been successfully updated. You can now sign in to the Digital Material Requisition System using your new password.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Back to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
