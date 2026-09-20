import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { ClipboardCheck } from 'lucide-react';

export default function Inbox({ pendingRequests }) {
  return (
    <AppShell title="Approval Inbox">
      <Head title="Approval Inbox - DMRS" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive / HoD Approval Inbox</h1>
          <p className="text-xs text-slate-500 mt-1">Requests requiring your explicit approval action.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Request No</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Department</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingRequests.data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No pending approval requests in your queue.
                  </td>
                </tr>
              ) : (
                pendingRequests.data.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-bold text-slate-900">{req.request_no}</td>
                    <td className="p-4 font-semibold text-slate-800">{req.requester?.name}</td>
                    <td className="p-4">{req.department?.name || '-'}</td>
                    <td className="p-4">{req.request_date}</td>
                    <td className="p-4"><StatusBadge status={req.status} /></td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/requests/${req.id}`}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors"
                      >
                        Review & Decision
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
