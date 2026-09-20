import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StockStatusBadge from '@/Components/StockStatusBadge';
import EmptyState from '@/Components/EmptyState';
import { Boxes, PlusCircle, RefreshCw, AlertTriangle, AlertOctagon, Package, ArrowRight } from 'lucide-react';

export default function StockOverview({ materials = { data: [] } }) {
  const { auth } = usePage().props;
  const user = auth.user;

  const breadcrumbs = [
    { title: 'Stock Control', href: null },
    { title: 'Stock Overview', href: null },
  ];

  const [stockInModal, setStockInModal] = useState(false);
  const [adjModal, setAdjModal] = useState(false);
  const [selectedMat, setSelectedMat] = useState(null);

  const stockInForm = useForm({
    material_id: '',
    qty: '',
    reference_no: '',
    supplier: '',
    storage_location: '',
    note: '',
  });

  const adjForm = useForm({
    material_id: '',
    target_qty: '',
    reason: '',
  });

  const openStockIn = (mat) => {
    setSelectedMat(mat);
    stockInForm.setData({
      material_id: mat.id,
      qty: '',
      reference_no: `IN-${Date.now()}`,
      supplier: '',
      storage_location: mat.storage_location || '',
      note: '',
    });
    setStockInModal(true);
  };

  const openAdj = (mat) => {
    setSelectedMat(mat);
    adjForm.setData({
      material_id: mat.id,
      target_qty: mat.stock_balance?.quantity || 0,
      reason: '',
    });
    setAdjModal(true);
  };

  const handleStockInSubmit = (e) => {
    e.preventDefault();
    stockInForm.post('/inventory/stock-in', {
      onSuccess: () => setStockInModal(false),
    });
  };

  const handleAdjSubmit = (e) => {
    e.preventDefault();
    adjForm.post('/inventory/stock-adjustment', {
      onSuccess: () => setAdjModal(false),
    });
  };

  return (
    <AppShell title="Stock Overview" breadcrumbs={breadcrumbs}>
      <Head title="Inventory Stock Overview - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Stock Overview & SOH Control</h1>
          <p className="text-xs text-slate-500">Real-time Stock On Hand (SOH), Min/Max thresholds, and stock entry management.</p>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Inventory Catalog SOH List</h2>
          </div>
        </div>

        {materials.data && materials.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Material No</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">UoM</th>
                  <th className="px-4 py-3 text-right">Current SOH</th>
                  <th className="px-4 py-3 text-right">Min Stock</th>
                  <th className="px-4 py-3 text-right">Max Stock</th>
                  <th className="px-4 py-3 text-center">Stock Status</th>
                  {user.role === 'ADMIN' && <th className="px-4 py-3 text-right">Inventory Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {materials.data.map((mat) => {
                  const soh = parseFloat(mat.stock_balance?.quantity || 0);
                  const minStock = parseFloat(mat.minimum_stock || 0);
                  const maxStock = parseFloat(mat.maximum_stock || 0);

                  return (
                    <tr key={mat.id} className="hover:bg-red-50/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-red-700">{mat.material_number}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{mat.description}</td>
                      <td className="px-4 py-3 text-slate-600">{mat.category?.name || '-'}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-500">{mat.uom}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {soh.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{minStock.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{maxStock > 0 ? maxStock.toFixed(2) : '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <StockStatusBadge soh={soh} minStock={minStock} />
                      </td>
                      {user.role === 'ADMIN' && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => openStockIn(mat)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs shadow-xs transition-colors"
                          >
                            + Stock In
                          </button>
                          <button
                            onClick={() => openAdj(mat)}
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                          >
                            Adjust
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No materials in stock catalog"
            description="There are no materials registered in the inventory database."
          />
        )}
      </div>

      {/* Stock In Modal */}
      {stockInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Stock In Entry</h3>
            <p className="text-xs text-slate-500">Record incoming stock batch for <strong className="text-slate-900">{selectedMat?.material_number}</strong>.</p>

            <form onSubmit={handleStockInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity In <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={stockInForm.data.qty}
                  onChange={(e) => stockInForm.setData('qty', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference No (PO / Delivery Order No) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={stockInForm.data.reference_no}
                  onChange={(e) => stockInForm.setData('reference_no', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={stockInForm.data.supplier}
                  onChange={(e) => stockInForm.setData('supplier', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setStockInModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs rounded-md font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={stockInForm.processing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-md font-semibold shadow-xs">
                  Confirm Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Stock Physical Adjustment</h3>
            <p className="text-xs text-slate-500">Adjust physical stock quantity for <strong className="text-slate-900">{selectedMat?.material_number}</strong>.</p>

            <form onSubmit={handleAdjSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Stock (SOH)</label>
                  <input
                    type="text"
                    value={parseFloat(selectedMat?.stock_balance?.quantity || 0).toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 text-xs bg-slate-100 font-mono font-bold text-slate-700 border border-slate-200 rounded-md cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Final Stock <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={adjForm.data.target_qty}
                    onChange={(e) => adjForm.setData('target_qty', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white font-mono font-bold border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {selectedMat && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Calculated Adjustment Delta:</span>
                  <span className={`font-mono font-bold ${
                    (parseFloat(adjForm.data.target_qty || 0) - parseFloat(selectedMat.stock_balance?.quantity || 0)) >= 0
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}>
                    {(parseFloat(adjForm.data.target_qty || 0) - parseFloat(selectedMat.stock_balance?.quantity || 0)) >= 0 ? '+' : ''}
                    {(parseFloat(adjForm.data.target_qty || 0) - parseFloat(selectedMat.stock_balance?.quantity || 0)).toFixed(2)} {selectedMat.uom}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Discrepancy Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows="2"
                  value={adjForm.data.reason}
                  onChange={(e) => adjForm.setData('reason', e.target.value)}
                  placeholder="Mandatory reason for physical stock discrepancy..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setAdjModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs rounded-md font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={adjForm.processing} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-md font-semibold shadow-xs">
                  {adjForm.processing ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

