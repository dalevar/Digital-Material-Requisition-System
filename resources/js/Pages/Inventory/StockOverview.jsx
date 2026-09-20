import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { Boxes, PlusCircle, RefreshCw } from 'lucide-react';

export default function StockOverview({ materials }) {
  const { auth } = usePage().props;
  const user = auth.user;

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
    <AppShell title="Stock Overview">
      <Head title="Inventory Stock Overview - DMRS" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory Stock Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time Stock on Hand (SOH), reorder levels, and stock entries.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Material No</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">UoM</th>
                <th className="p-4 text-right">SOH</th>
                <th className="p-4 text-right">Min Stock</th>
                <th className="p-4 text-center">Stock Status</th>
                {user.role === 'ADMIN' && <th className="p-4 text-right">Inventory Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.data.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">{mat.material_number}</td>
                  <td className="p-4">{mat.description}</td>
                  <td className="p-4">{mat.category?.name || '-'}</td>
                  <td className="p-4 text-center">{mat.uom}</td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    {parseFloat(mat.stock_balance?.quantity || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right">{parseFloat(mat.minimum_stock).toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <StatusBadge status={mat.stock_status} />
                  </td>
                  {user.role === 'ADMIN' && (
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openStockIn(mat)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-xs border border-emerald-200"
                      >
                        + Stock In
                      </button>
                      <button
                        onClick={() => openAdj(mat)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs"
                      >
                        Adjust
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In Modal */}
      {stockInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Stock In Entry</h3>
            <p className="text-xs text-slate-500">Add new inventory stock for {selectedMat?.material_number}.</p>

            <form onSubmit={handleStockInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity In *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={stockInForm.data.qty}
                  onChange={(e) => stockInForm.setData('qty', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reference No (PO / DO No) *</label>
                <input
                  type="text"
                  value={stockInForm.data.reference_no}
                  onChange={(e) => stockInForm.setData('reference_no', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={stockInForm.data.supplier}
                  onChange={(e) => stockInForm.setData('supplier', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setStockInModal(false)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={stockInForm.processing} className="px-4 py-2 bg-emerald-600 text-white text-xs rounded-xl font-semibold">
                  Confirm Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Stock Adjustment</h3>
            <p className="text-xs text-slate-500">Adjust target physical stock for {selectedMat?.material_number}.</p>

            <form onSubmit={handleAdjSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Stock Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={adjForm.data.target_qty}
                  onChange={(e) => adjForm.setData('target_qty', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Reason *</label>
                <textarea
                  rows="2"
                  value={adjForm.data.reason}
                  onChange={(e) => adjForm.setData('reason', e.target.value)}
                  placeholder="Reason for stock discrepancy..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setAdjModal(false)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={adjForm.processing} className="px-4 py-2 bg-blue-700 text-white text-xs rounded-xl font-semibold">
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
