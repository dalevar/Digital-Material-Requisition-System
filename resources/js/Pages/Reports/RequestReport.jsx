import React from 'react';
import { Head } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { Download } from 'lucide-react';

export default function RequestReport({ requests, filters }) {
  return (
    <AppShell title="Material Request Report">
      <Head title="Material Request Report - DMRS" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Material Request Comprehensive Report</h1>
          <p className="text-xs text-slate-500 mt-1">Exportable report of material requisitions, statuses, and approvers.</p>
        </div>
        <a
          href="/reports/requests/excel"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Request No</th>
                <th className="p-4">Doc No</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Department</th>
                <th className="p-4">Date</th>
                <th className="p-4">Approver</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.data.length > 0 ? (
                requests.data.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-bold text-slate-900">{req.request_no}</td>
                    <td className="p-4 text-slate-500">{req.no_doc || '-'}</td>
                    <td className="p-4 font-semibold text-slate-800">{req.requester?.name}</td>
                    <td className="p-4">{req.department?.name || '-'}</td>
                    <td className="p-4">{req.request_date}</td>
                    <td className="p-4">{req.approver?.name || '-'}</td>
                    <td className="p-4"><StatusBadge status={req.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                    No material request report records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
