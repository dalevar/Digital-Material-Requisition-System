import React, { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import EmptyState from '@/Components/EmptyState';
import { ShieldCheck, Filter, Download, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ meta }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{meta.from ?? 0}</span> –{' '}
        <span className="font-semibold text-slate-700">{meta.to ?? 0}</span> of{' '}
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
                  link.url ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 cursor-not-allowed'
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
                  link.url ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 cursor-not-allowed'
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

export default function AuditTrail({ logs, filters }) {
  const [search, setSearch] = useState(filters.search || '');
  const [module, setModule] = useState(filters.module || '');
  const [action, setAction] = useState(filters.action || '');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [selectedLog, setSelectedLog] = useState(null);

  const applyFilters = useCallback(() => {
    router.get(
      '/admin/audit-logs',
      {
        search: search || undefined,
        module: module || undefined,
        action: action || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
      { preserveState: true, preserveScroll: true }
    );
  }, [search, module, action, dateFrom, dateTo]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const resetFilters = () => {
    setSearch('');
    setModule('');
    setAction('');
    setDateFrom('');
    setDateTo('');
    router.get('/admin/audit-logs', {}, { preserveScroll: true });
  };

  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (module) params.append('module', module);
    if (action) params.append('action', action);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    return `/admin/audit-logs/excel?${params.toString()}`;
  };

  const activeFilterCount = [search, module, action, dateFrom, dateTo].filter(Boolean).length;
  const data = logs?.data ?? [];
  const meta = logs?.meta ?? logs;

  return (
    <AppShell title="System Audit Trail">
      <Head title="Audit Trail Log - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Immutable System Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">Complete system event logging, state changes, and user activity history.</p>
        </div>

        <a
          href={getExportUrl()}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Excel</span>
        </a>
      </div>

      {/* Toolbar & Filter Card */}
      <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, action, module, or description…"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>

          <input
            type="text"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            placeholder="Module (e.g. MaterialRequest)"
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
          />

          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Action (e.g. STOCK_OUT)"
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg font-medium transition-colors flex items-center"
                title="Reset Filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Date Range:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
          />
          <span>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
          />
        </div>
      </form>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-500 whitespace-nowrap">{log.created_at}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{log.user?.name || 'System'}</div>
                      <div className="text-[11px] text-red-600 font-semibold">{log.role || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{log.module}</td>
                    <td className="p-4">{log.description}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {(log.old_value || log.new_value) && (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Diff
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="No audit trail records"
            description={
              activeFilterCount > 0
                ? 'No audit log entries match your current search and filter criteria.'
                : 'System audit log entries will appear here automatically.'
            }
          />
        )}
        <Pagination meta={meta} />
      </div>

      {/* Audit Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Audit Log Details — {selectedLog.action}</h3>
            <p className="text-xs text-slate-500">{selectedLog.description}</p>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl overflow-x-auto">
                <div className="font-sans font-bold text-rose-800 mb-1">Old Value (Before)</div>
                <pre className="text-[11px] text-rose-900">{JSON.stringify(selectedLog.old_value, null, 2) || 'null'}</pre>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl overflow-x-auto">
                <div className="font-sans font-bold text-emerald-800 mb-1">New Value (After)</div>
                <pre className="text-[11px] text-emerald-900">{JSON.stringify(selectedLog.new_value, null, 2) || 'null'}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs rounded-xl font-semibold transition-colors">
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
