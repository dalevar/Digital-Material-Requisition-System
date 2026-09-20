import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { ShieldCheck, Filter } from 'lucide-react';

export default function AuditTrail({ logs, filters }) {
  const [module, setModule] = useState(filters.module || '');
  const [action, setAction] = useState(filters.action || '');
  const [selectedLog, setSelectedLog] = useState(null);

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/admin/audit-logs', { module, action }, { preserveState: true });
  };

  return (
    <AppShell title="System Audit Trail">
      <Head title="Audit Trail Log - DMRS" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Immutable System Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">Complete system event logging, state changes, and user activity history.</p>
        </div>
      </div>

      <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          placeholder="Filter Module (e.g. MaterialRequest, Inventory)"
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg min-w-[200px]"
        />

        <input
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filter Action (e.g. SUPPLEMENT_MRF, STOCK_OUT)"
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg min-w-[200px]"
        />

        <button type="submit" className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Audit Log</span>
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
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
              {logs.data.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-medium text-slate-500">{log.created_at}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{log.user?.name || 'System'}</div>
                    <div className="text-[11px] text-red-600 font-semibold">{log.role || '-'}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{log.module}</td>
                  <td className="p-4">{log.description}</td>
                  <td className="p-4 text-right">
                    {(log.old_value || log.new_value) && (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
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
      </div>

      {/* Audit Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 shadow-xl space-y-4">
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
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl font-semibold">
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
