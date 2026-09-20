import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import StatCard from '@/Components/StatCard';
import EmptyState from '@/Components/EmptyState';
import { Boxes, Package, AlertTriangle, AlertOctagon, FileText, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminDashboard({ stats = {}, recentActivity = [] }) {
  const breadcrumbs = [
    { title: 'System Administration', href: null },
    { title: 'Dashboard', href: null },
  ];

  return (
    <AppShell title="Admin Dashboard" breadcrumbs={breadcrumbs}>
      <Head title="System Admin Dashboard - DMRS" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Admin & Operational Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time material inventory monitoring, requisition management, approval oversight, and audit logs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/materials"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            Manage Materials
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            User Management
          </Link>
        </div>
      </div>

      {/* Primary Inventory Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Master Materials"
          value={stats.totalMaterials || 0}
          subtitle="Registered catalog items"
          icon={Package}
        />
        <StatCard
          title="Total Stock Quantity"
          value={stats.totalStockQty || 0}
          subtitle="Stock On Hand (SOH)"
          icon={Boxes}
        />
        <StatCard
          title="Low Stock Alert"
          value={stats.lowStock || 0}
          subtitle="Items at or below Min Stock"
          icon={AlertTriangle}
          variant={stats.lowStock > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Out of Stock Alert"
          value={stats.outOfStock || 0}
          subtitle="Items with 0 SOH"
          icon={AlertOctagon}
          variant={stats.outOfStock > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Secondary Requisition Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Pending Approvals</span>
          <div className="text-xl font-black text-amber-700 mt-1">{stats.pendingRequests || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Approved Requests</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{stats.approvedRequests || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase text-red-700 tracking-wider">Rejected Requests</span>
          <div className="text-xl font-black text-red-700 mt-1">{stats.rejectedRequests || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase text-sky-700 tracking-wider">Completed Requests</span>
          <div className="text-xl font-black text-sky-700 mt-1">{stats.completedRequests || 0}</div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent System Activity</h2>
          </div>
          <Link href="/requests" className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1">
            <span>View All Requisitions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentActivity && recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Request No</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Plant</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentActivity.map((req) => (
                  <tr key={req.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-700">{req.request_no}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{req.requester?.name || '-'}</td>
                    <td className="px-4 py-3">{req.department?.name || '-'}</td>
                    <td className="px-4 py-3">{req.plant?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/requests/${req.id}`}
                        className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No recent activity" description="There are no recent requisitions recorded in the system yet." />
        )}
      </div>
    </AppShell>
  );
}

