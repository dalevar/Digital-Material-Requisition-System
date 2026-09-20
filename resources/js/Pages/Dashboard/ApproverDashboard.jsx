import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { ClipboardCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ApproverDashboard({ stats, pendingRequests }) {
  return (
    <AppShell title="Approver Dashboard">
      <Head title="Executive / HoD Approval Dashboard - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive / HoD Approval Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Review pending Material Requisition Forms (MRF) assigned to your approval scope.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Pending Approval</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{stats.pendingApproval}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Approved By You</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.approved}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Rejected By You</div>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">{stats.rejected}</div>
          </div>
        </div>
      </div>

      {/* Pending Approval Inbox Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Approval Inbox (Action Required)</h2>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {pendingRequests.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Request No</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Department</th>
                <th className="p-4">Items</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Your approval inbox is clear. No pending requests.
                  </td>
                </tr>
              ) : (
                pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{req.request_no}</td>
                    <td className="p-4 font-semibold text-slate-800">{req.requester?.name}</td>
                    <td className="p-4">{req.department?.name || '-'}</td>
                    <td className="p-4 font-medium">{req.items?.length || 0} Material(s)</td>
                    <td className="p-4">{req.request_date}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/requests/${req.id}`}
                        className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                      >
                        Review & Approve
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
