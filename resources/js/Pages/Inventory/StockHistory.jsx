import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { History, Filter } from 'lucide-react';

export default function StockHistory({ transactions, materials, filters }) {
  const [materialId, setMaterialId] = useState(filters.material_id || '');
  const [txType, setTxType] = useState(filters.transaction_type || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/inventory/history', { material_id: materialId, transaction_type: txType }, { preserveState: true });
  };

  return (
    <AppShell title="Stock Movement History">
      <Head title="Stock Transaction History - DMRS" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Transaction History</h1>
          <p className="text-xs text-slate-500 mt-1">Audit log of all stock in, stock out, adjustments, and reversals.</p>
        </div>
      </div>

      <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-wrap gap-3 items-center">
        <select
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
        >
          <option value="">All Materials</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.material_number} - {m.description}</option>
          ))}
        </select>

        <select
          value={txType}
          onChange={(e) => setTxType(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
        >
          <option value="">All Transaction Types</option>
          <option value="STOCK_IN">STOCK_IN</option>
          <option value="STOCK_OUT">STOCK_OUT</option>
          <option value="ADJUSTMENT">ADJUSTMENT</option>
          <option value="REVERSAL">REVERSAL</option>
        </select>

        <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Material No</th>
                <th className="p-4">Type</th>
                <th className="p-4">Reference</th>
                <th className="p-4 text-right">Qty In</th>
                <th className="p-4 text-right">Qty Out</th>
                <th className="p-4 text-right">Balance After</th>
                <th className="p-4">Executed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.data.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80">
                  <td className="p-4">{tx.transaction_date}</td>
                  <td className="p-4 font-bold text-slate-900">{tx.material?.material_number}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.transaction_type === 'STOCK_IN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      tx.transaction_type === 'STOCK_OUT' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      tx.transaction_type === 'REVERSAL' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{tx.reference_no || '-'}</td>
                  <td className="p-4 text-right text-emerald-600 font-bold">{parseFloat(tx.qty_in) > 0 ? `+${parseFloat(tx.qty_in).toFixed(2)}` : '-'}</td>
                  <td className="p-4 text-right text-rose-600 font-bold">{parseFloat(tx.qty_out) > 0 ? `-${parseFloat(tx.qty_out).toFixed(2)}` : '-'}</td>
                  <td className="p-4 text-right font-bold text-slate-900">{parseFloat(tx.balance_after).toFixed(2)}</td>
                  <td className="p-4">{tx.user?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
