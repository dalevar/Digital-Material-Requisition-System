import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import EmptyState from '@/Components/EmptyState';
import { History, Filter, X } from 'lucide-react';

export default function StockHistory({ transactions = { data: [] }, materials = [], filters = {} }) {
  const breadcrumbs = [
    { title: 'Stock Control', href: '/inventory/overview' },
    { title: 'Stock History', href: null },
  ];

  const [materialId, setMaterialId] = useState(filters.material_id || '');
  const [txType, setTxType] = useState(filters.transaction_type || '');

  const handleFilter = (e) => {
    if (e) e.preventDefault();
    router.get('/inventory/history', { material_id: materialId, transaction_type: txType }, { preserveState: true });
  };

  const handleReset = () => {
    setMaterialId('');
    setTxType('');
    router.get('/inventory/history', {}, { preserveState: true });
  };

  return (
    <AppShell title="Stock Movement History" breadcrumbs={breadcrumbs}>
      <Head title="Stock Transaction History - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Transaction History & Audit Ledger</h1>
          <p className="text-xs text-slate-500">Immutable audit log of all Stock In, Stock Out, Physical Adjustments, and Reversals.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs mb-6 flex flex-wrap gap-3 items-center">
        <select
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none flex-1 min-w-[200px]"
        >
          <option value="">All Catalog Materials</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.material_number} - {m.description}</option>
          ))}
        </select>

        <select
          value={txType}
          onChange={(e) => setTxType(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none min-w-[180px]"
        >
          <option value="">All Transaction Types</option>
          <option value="STOCK_IN">STOCK_IN (Incoming)</option>
          <option value="STOCK_OUT">STOCK_OUT (Dispatched)</option>
          <option value="ADJUSTMENT">ADJUSTMENT (Physical Count)</option>
          <option value="REVERSAL">REVERSAL (Cancellation Return)</option>
        </select>

        <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>Apply Filter</span>
        </button>

        {(materialId || txType) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </form>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Stock Transaction Ledger</h2>
          </div>
        </div>

        {transactions.data && transactions.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Material No</th>
                  <th className="px-4 py-3">Transaction Type</th>
                  <th className="px-4 py-3">Reference No</th>
                  <th className="px-4 py-3 text-right">Qty In</th>
                  <th className="px-4 py-3 text-right">Qty Out</th>
                  <th className="px-4 py-3 text-right">Balance After</th>
                  <th className="px-4 py-3">Executed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.data.map((tx) => (
                  <tr key={tx.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-medium">{tx.transaction_date}</td>
                    <td className="px-4 py-3 font-bold text-red-700">{tx.material?.material_number || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        tx.transaction_type === 'STOCK_IN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        tx.transaction_type === 'STOCK_OUT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        tx.transaction_type === 'REVERSAL' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">{tx.reference_no || '-'}</td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-mono font-bold">
                      {parseFloat(tx.qty_in || 0) > 0 ? `+${parseFloat(tx.qty_in).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-red-700 font-mono font-bold">
                      {parseFloat(tx.qty_out || 0) > 0 ? `-${parseFloat(tx.qty_out).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {parseFloat(tx.balance_after || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{tx.user?.name || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No stock transaction history"
            description="No inventory transactions match your current search criteria."
          />
        )}
      </div>
    </AppShell>
  );
}

