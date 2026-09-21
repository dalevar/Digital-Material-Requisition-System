import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import StatCard from '@/Components/StatCard';
import EmptyState from '@/Components/EmptyState';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function ApproverDashboard({ stats = {}, pendingRequests = [] }) {
  const breadcrumbs = [
    { title: 'Executive Approver', href: null },
    { title: 'Dashboard', href: null },
  ];

  return (
    <AppShell title="Approver Dashboard" breadcrumbs={breadcrumbs}>
      <Head title="Executive / HoD Approval Dashboard - DMRS" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive / HoD Approval Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review pending Material Requisition Forms (MRF) assigned to your department approval scope.
          </p>
        </div>
        <Link
          href="/approvals/inbox"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
        >
          Open Approval Inbox
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Pending Approval Queue"
          value={stats.pendingApproval || 0}
          subtitle="Requires your review"
          icon={Clock}
          variant={stats.pendingApproval > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Approved By You"
          value={stats.approved || 0}
          subtitle="Requests authorized"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Rejected By You"
          value={stats.rejected || 0}
          subtitle="Requests declined"
          icon={XCircle}
          variant={stats.rejected > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Pending Approval Inbox Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Urgent Approval Queue (Action Required)</h2>
          </div>
          <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            {pendingRequests.length} Pending
          </span>
        </div>

        {pendingRequests && pendingRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Request No</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Submitted Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-700">{req.request_no}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{req.requester?.name || '-'}</td>
                    <td className="px-4 py-3">{req.department?.name || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{req.items?.length || 0} Material(s)</td>
                    <td className="px-4 py-3 text-slate-600">{req.request_date}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/requests/${req.id}`}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold text-xs transition-colors shadow-xs"
                      >
                        Review & Decision
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="Approval inbox is clear"
            description="All material requisitions assigned to your approval scope have been reviewed."
          />
        )}
      </div>
    </AppShell>
  );
}

