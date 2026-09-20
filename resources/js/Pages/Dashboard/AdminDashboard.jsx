import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { Boxes, Package, AlertTriangle, AlertOctagon, FileText, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function AdminDashboard({ stats, recentActivity }) {
  return (
    <AppShell title="Admin Dashboard">
      <Head title="System Admin Dashboard - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Admin & Stock Control Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">System-wide inventory control, request management, audit trail, and user administration.</p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Material Master</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalMaterials}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Stock Quantity</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalStockQty}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Low Stock Alert</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{stats.lowStock}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Out of Stock Alert</div>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">{stats.outOfStock}</div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
          <div className="text-xs font-medium text-slate-500">Pending Requests</div>
          <div className="text-lg font-bold text-amber-600 mt-1">{stats.pendingRequests}</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
          <div className="text-xs font-medium text-slate-500">Approved Requests</div>
          <div className="text-lg font-bold text-emerald-600 mt-1">{stats.approvedRequests}</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
          <div className="text-xs font-medium text-slate-500">Rejected Requests</div>
          <div className="text-lg font-bold text-rose-600 mt-1">{stats.rejectedRequests}</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
          <div className="text-xs font-medium text-slate-500">Completed Requests</div>
          <div className="text-lg font-bold text-blue-600 mt-1">{stats.completedRequests}</div>
        </div>
      </div>

      {/* System Activity Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">System Activity Overview</h2>
          <Link href="/requests" className="text-xs font-semibold text-blue-700 hover:underline">
            All Requests →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Request No</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Department</th>
                <th className="p-4">Plant</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivity.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{req.request_no}</td>
                  <td className="p-4 font-semibold text-slate-800">{req.requester?.name}</td>
                  <td className="p-4">{req.department?.name || '-'}</td>
                  <td className="p-4">{req.plant?.name || '-'}</td>
                  <td className="p-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/requests/${req.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
