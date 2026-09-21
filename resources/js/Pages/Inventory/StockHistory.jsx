import React, { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import EmptyState from '@/Components/EmptyState';
import { History, Filter, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function StockHistory({ transactions = { data: [] }, materials = [], users = [], filters = {} }) {
  const breadcrumbs = [
    { title: 'Stock Control', href: '/inventory/overview' },
    { title: 'Stock History', href: null },
  ];

  const [search, setSearch] = useState(filters.search ?? '');
  const [materialId, setMaterialId] = useState(filters.material_id ?? '');
  const [txType, setTxType] = useState(filters.transaction_type ?? '');
  const [userId, setUserId] = useState(filters.user_id ?? '');
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
  const [dateTo, setDateTo] = useState(filters.date_to ?? '');

  const activeFilterCount = [materialId, txType, userId, dateFrom, dateTo].filter(Boolean).length;

  const handleFilter = useCallback(
    (e) => {
      if (e) e.preventDefault();
      router.get(
        '/inventory/history',
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

  const handleReset = () => {
    setSearch('');
    setMaterialId('');
    setTxType('');
    setUserId('');
    setDateFrom('');
    setDateTo('');
    router.get('/inventory/history', {}, { preserveScroll: true });
  };

  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (materialId) params.append('material_id', materialId);
    if (txType) params.append('transaction_type', txType);
    if (userId) params.append('user_id', userId);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    return `/inventory/history/excel?${params.toString()}`;
  };

  const data = transactions?.data ?? [];
  const meta = transactions?.meta ?? transactions;

  return (
    <AppShell title="Stock Movement History" breadcrumbs={breadcrumbs}>
      <Head title="Stock Transaction History - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Transaction History & Audit Ledger</h1>
          <p className="text-xs text-slate-500">Immutable audit log of all Stock In, Stock Out, Physical Adjustments, and Reversals.</p>
        </div>

        <a
          href={getExportUrl()}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </a>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search Keyword</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Material, Reference No, Note, User…"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Material</label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Catalog Materials</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.material_number} - {m.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Transaction Type</label>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Transaction Types</option>
              <option value="STOCK_IN">STOCK_IN (Incoming)</option>
              <option value="STOCK_OUT">STOCK_OUT (Dispatched)</option>
              <option value="ADJUSTMENT">ADJUSTMENT (Physical Count)</option>
              <option value="REVERSAL">REVERSAL (Cancellation Return)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          {(search || activeFilterCount > 0) && (
            <button
              type="button"
              onClick={handleReset}
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
            <span>Apply Filter</span>
          </button>
        </div>
      </form>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Stock Transaction Ledger</h2>
          </div>
        </div>

        {data.length > 0 ? (
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
                {data.map((tx) => {
                  const type = isObject(tx.transaction_type) ? tx.transaction_type.value : tx.transaction_type;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 font-medium">{tx.transaction_date}</td>
                      <td className="px-4 py-3 font-bold text-red-700">{tx.material?.material_number || '-'}</td>
                      <td className="px-4 py-3">
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
                    </tr>
                  );
                })}
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
        <Pagination meta={meta} />
      </div>
    </AppShell>
  );
}

function isObject(val) {
  return val !== null && typeof val === 'object';
}
