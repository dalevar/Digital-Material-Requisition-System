import React from 'react';
import { Head } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import StatCard from '@/Components/StatCard';
import { Package, ArrowDownRight, ArrowUpRight, AlertTriangle, Download } from 'lucide-react';

export default function StockReport({ reports = [] }) {
  const reportsList = Array.isArray(reports) ? reports : (reports.data || []);

  const totalMaterials = reportsList.length;
  const totalStockIn = reportsList.reduce((sum, r) => sum + (parseFloat(r.stock_in) || 0), 0);
  const totalStockOut = reportsList.reduce((sum, r) => sum + (parseFloat(r.stock_out) || 0), 0);
  const lowStockCount = reportsList.filter(
    (r) => r.status === 'LOW STOCK' || r.status === 'OUT OF STOCK'
  ).length;

  return (
    <AppShell title="Stock Movement Report">
      <Head title="Stock Movement Report - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Movement & Closing Report</h1>
          <p className="text-xs text-slate-500 mt-1">
            Summary of total stock in, total stock out, closing SOH, and minimum stock alerts.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Cataloged Materials"
          value={totalMaterials}
          subtitle="Total unique catalog items"
          icon={Package}
          accentColor="slate"
        />
        <StatCard
          title="Total Stock In Volume"
          value={`+${totalStockIn.toLocaleString()}`}
          subtitle="Cumulative inbound receipts"
          icon={ArrowDownRight}
          accentColor="emerald"
        />
        <StatCard
          title="Total Stock Out Volume"
          value={`-${totalStockOut.toLocaleString()}`}
          subtitle="Cumulative outbound issues"
          icon={ArrowUpRight}
          accentColor="rose"
        />
        <StatCard
          title="Critical / Low Stock"
          value={lowStockCount}
          subtitle="Items below min threshold"
          icon={AlertTriangle}
          accentColor={lowStockCount > 0 ? 'red' : 'slate'}
        />
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
              {reportsList.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{mat.material_number}</td>
                  <td className="p-4 font-medium text-slate-800">{mat.description}</td>
                  <td className="p-4 text-center font-medium text-slate-500">{mat.uom}</td>
                  <td className="p-4 text-right text-emerald-600 font-bold">
                    +{parseFloat(mat.stock_in || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right text-rose-600 font-bold">
                    -{parseFloat(mat.stock_out || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    {parseFloat(mat.closing_stock || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right text-slate-500">
                    {parseFloat(mat.minimum_stock || 0).toFixed(2)}
                  </td>
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
