import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { PlusCircle, Search, Filter, FileText, Download } from 'lucide-react';

export default function Index({ requests, filters }) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/requests', { search, status }, { preserveState: true });
  };

  return (
    <AppShell title="Material Requisitions">
      <Head title="Material Requisitions - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Material Requisitions</h1>
          <p className="text-xs text-slate-500 mt-1">Browse, filter, and manage all material requisition forms.</p>
        </div>
        <Link
          href="/requests/create"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Requisition</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Request No, Doc No, Requester..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED_AFTER_APPROVAL">Cancelled (Post-Approval)</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </form>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Request No</th>
                <th className="p-4">Doc Reference</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Department</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No material requests found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                requests.data.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{req.request_no}</td>
                    <td className="p-4 font-medium text-slate-500">{req.no_doc || '-'}</td>
                    <td className="p-4 font-semibold text-slate-800">{req.requester?.name}</td>
                    <td className="p-4">{req.department?.name || '-'}</td>
                    <td className="p-4">{req.request_date}</td>
                    <td className="p-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <a
                        href={`/requests/${req.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 inline-flex items-center text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Download Official PDF MRF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/requests/${req.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                      >
                        View
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
