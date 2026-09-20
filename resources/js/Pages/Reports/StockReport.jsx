import React, { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import StatCard from '@/Components/StatCard';
import EmptyState from '@/Components/EmptyState';
import {
  Package,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Download,
  Filter,
  X,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  Layers,
  List
} from 'lucide-react';

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

function isObject(val) {
  return val !== null && typeof val === 'object';
}

export default function StockReport({
  movements = { data: [] },
  reports = [],
  materials = [],
  users = [],
  filters = {},
}) {
  const breadcrumbs = [
    { title: 'Reports', href: '/reports/requests' },
    { title: 'Stock Report', href: null },
  ];

  const [activeTab, setActiveTab] = useState('movements'); // 'movements' | 'summary'

  const [search, setSearch] = useState(filters.search ?? '');
  const [materialId, setMaterialId] = useState(filters.material_id ?? '');
  const [txType, setTxType] = useState(filters.transaction_type ?? '');
  const [userId, setUserId] = useState(filters.user_id ?? '');
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
  const [dateTo, setDateTo] = useState(filters.date_to ?? '');

  const activeFilterCount = [materialId, txType, userId, dateFrom, dateTo].filter(Boolean).length;

  const applyFilters = useCallback(
    (e) => {
      if (e) e.preventDefault();
      router.get(
        '/reports/stock',
        {
          search: search || undefined,
          material_id: materialId || undefined,
          transaction_type: txType || undefined,
          user_id: userId || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
        { preserveScroll: true, preserveState: true }
      );
    },
    [search, materialId, txType, userId, dateFrom, dateTo]
  );

  const resetFilters = () => {
    setSearch('');
    setMaterialId('');
    setTxType('');
    setUserId('');
    setDateFrom('');
    setDateTo('');
    router.get('/reports/stock', {}, { preserveScroll: true });
  };

  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (materialId) params.append('material_id', materialId);
    if (txType) params.append('transaction_type', txType);
    if (userId) params.append('user_id', userId);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    return `/reports/stock/excel?${params.toString()}`;
  };

  const movementData = movements?.data ?? [];
  const meta = movements?.meta ?? movements;

  const reportsList = Array.isArray(reports) ? reports : (reports.data || []);
  const totalMaterials = reportsList.length;
  const totalStockIn = reportsList.reduce((sum, r) => sum + (parseFloat(r.stock_in) || 0), 0);
  const totalStockOut = reportsList.reduce((sum, r) => sum + (parseFloat(r.stock_out) || 0), 0);
  const lowStockCount = reportsList.filter(
    (r) => r.status === 'LOW STOCK' || r.status === 'OUT OF STOCK'
  ).length;

  return (
    <AppShell title="Stock Report" breadcrumbs={breadcrumbs}>
      <Head title="Stock Report - DMRS" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock & Movement Report</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive audit report of material stock levels, stock movement transactions, and closing SOH balances.
          </p>
        </div>
        <a
          href={getExportUrl()}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </a>
      </div>

      {/* KPI Stat Cards */}
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

      {/* Comprehensive Filter Toolbar */}
      <form onSubmit={applyFilters} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Keyword
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Material No, Description, Ref No, Executed By..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Material
            </label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Materials</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.material_number} - {m.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Transaction Type
            </label>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Types</option>
              <option value="STOCK_IN">STOCK_IN</option>
              <option value="STOCK_OUT">STOCK_OUT</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
              <option value="REVERSAL">REVERSAL</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Executed By
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          {(search || activeFilterCount > 0) && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs flex items-center space-x-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </form>

      {/* Main View Container with Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Navigation Header */}
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('movements')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'movements'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-red-600" />
              <span>Stock Movements ({meta.total ?? movementData.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Material Summary ({reportsList.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Stock Movements Table */}
        {activeTab === 'movements' && (
          <>
            {movementData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Material Number</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-center">Type</th>
                      <th className="px-4 py-3">Reference No</th>
                      <th className="px-4 py-3 text-right">Qty In</th>
                      <th className="px-4 py-3 text-right">Qty Out</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                      <th className="px-4 py-3">Executed By</th>
                      <th className="px-4 py-3">Note / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {movementData.map((tx) => {
                      const type = isObject(tx.transaction_type)
                        ? tx.transaction_type.value
                        : tx.transaction_type;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-600 font-medium">{tx.transaction_date}</td>
                          <td className="px-4 py-3 font-bold text-red-700">{tx.material?.material_number || '-'}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{tx.material?.description || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                type === 'STOCK_IN'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : type === 'STOCK_OUT'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : type === 'REVERSAL'
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-800">{tx.reference_no || '-'}</td>
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
                          <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={tx.note || tx.reason || ''}>
                            {tx.note || tx.reason || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={FileBarChart}
                title="No stock movement records"
                description="No inventory transaction records match your search and filter criteria."
              />
            )}
            <Pagination meta={meta} />
          </>
        )}

        {/* Tab 2: Material Summary Table */}
        {activeTab === 'summary' && (
          <div className="overflow-x-auto">
            {reportsList.length > 0 ? (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
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
            ) : (
              <EmptyState
                icon={Package}
                title="No material items found"
                description="No material records match your search query."
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
