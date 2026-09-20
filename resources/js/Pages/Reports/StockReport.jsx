import React from 'react';
import { Head } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';

export default function StockReport({ reports }) {
  return (
    <AppShell title="Stock Movement Report">
      <Head title="Stock Movement Report - DMRS" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Movement & Closing Report</h1>
          <p className="text-xs text-slate-500 mt-1">Summary of total stock in, total stock out, closing SOH, and minimum stock alerts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Material No</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">UoM</th>
                <th className="p-4 text-right">Total Stock In</th>
                <th className="p-4 text-right">Total Stock Out</th>
                <th className="p-4 text-right">Closing SOH</th>
                <th className="p-4 text-right">Min Stock</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">{mat.material_number}</td>
                  <td className="p-4">{mat.description}</td>
                  <td className="p-4 text-center">{mat.uom}</td>
                  <td className="p-4 text-right text-emerald-600 font-bold">+{parseFloat(mat.stock_in).toFixed(2)}</td>
                  <td className="p-4 text-right text-rose-600 font-bold">-{parseFloat(mat.stock_out).toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-slate-900">{parseFloat(mat.closing_stock).toFixed(2)}</td>
                  <td className="p-4 text-right">{parseFloat(mat.minimum_stock).toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <StatusBadge status={mat.status} />
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
