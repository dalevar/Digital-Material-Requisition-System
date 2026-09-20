import React, { useState, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import {
  ClipboardCheck,
  CheckCircle2,
  Eye,
  ShieldAlert,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

// ─── Shared Utilities ────────────────────────────────────────────────────────

function Pagination({ meta }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
      <p className="text-xs text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-700">{meta.from ?? 0}</span>
        {' '}–{' '}
        <span className="font-semibold text-slate-700">{meta.to ?? 0}</span>
        {' '}of{' '}
        <span className="font-semibold text-slate-700">{meta.total}</span>
      </p>
      <div className="flex items-center space-x-1">
        {meta.links?.map((link, i) => {
          if (link.label.includes('Previous')) {
            return (
              <Link
                key={i}
                href={link.url ?? '#'}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  link.url
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                preserveScroll
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            );
          }
          if (link.label.includes('Next')) {
            return (
              <Link
                key={i}
                href={link.url ?? '#'}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  link.url
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                preserveScroll
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            );
          }
          return (
            <Link
              key={i}
              href={link.url ?? '#'}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                link.active
                  ? 'bg-red-600 text-white'
                  : link.url
                  ? 'text-slate-600 hover:bg-slate-200'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              preserveScroll
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin Monitoring Inbox ───────────────────────────────────────────────────

function AdminMonitoringInbox({ requests, filters, departments, plants, approvers }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [departmentId, setDepartmentId] = useState(filters.department_id ?? '');
  const [plantId, setPlantId] = useState(filters.plant_id ?? '');
  const [approverId, setApproverId] = useState(filters.approver_id ?? '');
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
  const [dateTo, setDateTo] = useState(filters.date_to ?? '');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [departmentId, plantId, approverId, dateFrom, dateTo].filter(Boolean).length;

  const applyFilters = useCallback(() => {
    router.get(
      '/approvals/inbox',
      {
        search: search || undefined,
        status: status || undefined,
        department_id: departmentId || undefined,
        plant_id: plantId || undefined,
        approver_id: approverId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
      { preserveScroll: true, preserveState: true }
    );
  }, [search, status, departmentId, plantId, approverId, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setDepartmentId('');
    setPlantId('');
    setApproverId('');
    setDateFrom('');
    setDateTo('');
    router.get('/approvals/inbox', {}, { preserveScroll: true });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') applyFilters();
  };

  const data = requests?.data ?? [];
  const meta = requests?.meta ?? requests;

  const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'PENDING_APPROVAL', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'CANCELLED_AFTER_APPROVAL', label: 'Cancelled (Post-Approval)' },
  ];

  return (
    <>
      {/* Admin Read-Only Banner */}
      <div className="mb-4 flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
        <div>
          <span className="font-semibold">Approval Monitoring — Administrator View. </span>
          Approval decisions can only be performed by the assigned Approver.
          This view is read-only.
        </div>
      </div>

      {/* Search + Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs mb-4">
        <div className="p-3 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by request no, requester, or department…"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={applyFilters}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            </button>
            {(search || status || activeFilterCount > 0) && (
              <button
                onClick={resetFilters}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="border-t border-slate-200 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Departments</option>
                {(departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plant</label>
              <select
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Plants</option>
                {(plants ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Approver</label>
              <select
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Approvers</option>
                {(approvers ?? []).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center space-x-1 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              router.get(
                '/approvals/inbox',
                {
                  ...(search ? { search } : {}),
                  ...(tab.value ? { status: tab.value } : {}),
                  ...(departmentId ? { department_id: departmentId } : {}),
                  ...(plantId ? { plant_id: plantId } : {}),
                  ...(approverId ? { approver_id: approverId } : {}),
                  ...(dateFrom ? { date_from: dateFrom } : {}),
                  ...(dateTo ? { date_to: dateTo } : {}),
                },
                { preserveScroll: true }
              );
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
              status === tab.value
                ? 'bg-red-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Approval Monitoring</h2>
          </div>
          <span className="text-xs text-slate-500">{meta?.total ?? data.length} total records</span>
        </div>

        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Request No</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Plant</th>
                  <th className="px-4 py-3">Assigned Approver</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-700">{req.request_no}</td>
                    <td className="px-4 py-3 text-slate-500">{req.request_date}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{req.requester?.name ?? '—'}</td>
                    <td className="px-4 py-3">{req.department?.name ?? '—'}</td>
                    <td className="px-4 py-3">{req.plant?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      {req.approver ? (
                        <span className="font-medium text-slate-700">{req.approver.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/requests/${req.id}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No records found"
            description={
              search || status || activeFilterCount > 0
                ? 'No approval records match the current filters. Try adjusting your search or clearing filters.'
                : 'No approval-relevant requests exist in the system yet.'
            }
          />
        )}

        <Pagination meta={meta} />
      </div>
    </>
  );
}

// ─── Approver Inbox ───────────────────────────────────────────────────────────

function ApproverInbox({ requests, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');

  const applySearch = () => {
    router.get('/approvals/inbox', { search: search || undefined }, { preserveScroll: true });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applySearch();
  };

  const data = requests?.data ?? [];
  const meta = requests?.meta ?? requests;

  return (
    <>
      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by request no or requester…"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          />
        </div>
        <button
          onClick={applySearch}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            onClick={() => {
              setSearch('');
              router.get('/approvals/inbox', {}, { preserveScroll: true });
            }}
            className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Pending Requests Queue</h2>
          </div>
          <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            {meta?.total ?? data.length} Pending
          </span>
        </div>

        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Request No</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Submitted Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((req) => (
                  <tr key={req.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-700">{req.request_no}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{req.requester?.name ?? '—'}</td>
                    <td className="px-4 py-3">{req.department?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      {req.items?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{req.request_date}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/requests/${req.id}`}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold text-xs transition-colors shadow-xs"
                      >
                        Review &amp; Decision
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
            description={
              search
                ? 'No requests match your search. Try different keywords.'
                : 'There are currently no pending material requisitions waiting for your review.'
            }
          />
        )}

        <Pagination meta={meta} />
      </div>
    </>
  );
}

// ─── Main Inbox Page ──────────────────────────────────────────────────────────

export default function Inbox({
  pendingRequests = { data: [] },
  isAdminMonitoring = false,
  filters = {},
  departments = [],
  plants = [],
  approvers = [],
}) {
  const breadcrumbs = isAdminMonitoring
    ? [
        { title: 'Administration', href: '/admin/dashboard' },
        { title: 'Approval Monitoring', href: null },
      ]
    : [
        { title: 'Executive Approver', href: '/approver/dashboard' },
        { title: 'Approval Inbox', href: null },
      ];

  const pageTitle = isAdminMonitoring ? 'Approval Monitoring' : 'Approval Inbox';
  const pageDescription = isAdminMonitoring
    ? 'Monitor request approval status, assigned approvers, and approval history across all departments.'
    : 'Material requisition forms requiring your review and authorization decision.';

  return (
    <AppShell title={pageTitle} breadcrumbs={breadcrumbs}>
      <Head title={`${pageTitle} - DMRS`} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isAdminMonitoring ? 'Approval Monitoring' : 'Executive / HoD Approval Inbox'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{pageDescription}</p>
        </div>
      </div>

      {isAdminMonitoring ? (
        <AdminMonitoringInbox
          requests={pendingRequests}
          filters={filters}
          departments={departments}
          plants={plants}
          approvers={approvers}
        />
      ) : (
        <ApproverInbox requests={pendingRequests} filters={filters} />
      )}
    </AppShell>
  );
}
