import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StockStatusBadge from '@/Components/StockStatusBadge';
import EmptyState from '@/Components/EmptyState';
import { Boxes, PlusCircle, RefreshCw, AlertTriangle, Package, Calendar, Tag, Truck, MapPin, FileText, CheckCircle } from 'lucide-react';

export default function StockOverview({ materials = { data: [] } }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const materialList = materials.data || [];

  const breadcrumbs = [
    { title: 'Stock Control', href: null },
    { title: 'Stock Overview', href: null },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const [stockInModal, setStockInModal] = useState(false);
  const [adjModal, setAdjModal] = useState(false);
  const [selectedMat, setSelectedMat] = useState(null);

  const stockInForm = useForm({
    material_id: '',
    quantity: '',
    qty: '',
    transaction_date: todayStr,
    reference_no: '',
    supplier: '',
    storage_location: '',
    note: '',
  });

  const adjForm = useForm({
    material_id: '',
    adjustment_quantity: '',
    transaction_date: todayStr,
    reason: '',
    note: '',
  });

  const openStockIn = (mat = null) => {
    const targetMat = mat || materialList[0] || null;
    setSelectedMat(targetMat);
    stockInForm.reset();
    stockInForm.clearErrors();
    stockInForm.setData({
      material_id: targetMat ? targetMat.id : '',
      quantity: '',
      qty: '',
      transaction_date: todayStr,
      reference_no: `IN-${Date.now().toString().slice(-6)}`,
      supplier: '',
      storage_location: targetMat ? targetMat.storage_location || '' : '',
      note: '',
    });
    setStockInModal(true);
  };

  const openAdj = (mat = null) => {
    const targetMat = mat || materialList[0] || null;
    setSelectedMat(targetMat);
    adjForm.reset();
    adjForm.clearErrors();
    adjForm.setData({
      material_id: targetMat ? targetMat.id : '',
      adjustment_quantity: '',
      transaction_date: todayStr,
      reason: '',
      note: '',
    });
    setAdjModal(true);
  };

  const handleMaterialChangeForStockIn = (matId) => {
    const mat = materialList.find((m) => String(m.id) === String(matId)) || null;
    setSelectedMat(mat);
    stockInForm.setData((prev) => ({
      ...prev,
      material_id: matId,
      storage_location: mat ? mat.storage_location || '' : prev.storage_location,
    }));
  };

  const handleMaterialChangeForAdj = (matId) => {
    const mat = materialList.find((m) => String(m.id) === String(matId)) || null;
    setSelectedMat(mat);
    adjForm.setData('material_id', matId);
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

  // Stock In Preview Calculation
  const currentSohIn = selectedMat ? parseFloat(selectedMat.stock_balance?.quantity || 0) : 0;
  const qtyInInput = parseFloat(stockInForm.data.quantity || stockInForm.data.qty || 0);
  const finalStockInPreview = currentSohIn + (isNaN(qtyInInput) ? 0 : qtyInInput);

  // Stock Adjustment Preview Calculation & Validation
  const currentSohAdj = selectedMat ? parseFloat(selectedMat.stock_balance?.quantity || 0) : 0;
  const adjQtyInput = parseFloat(adjForm.data.adjustment_quantity || 0);
  const finalStockAdjPreview = currentSohAdj + (isNaN(adjQtyInput) ? 0 : adjQtyInput);

  const isAdjNegative = finalStockAdjPreview < 0;
  const isAdjZero = isNaN(adjQtyInput) || Math.abs(adjQtyInput) < 0.00001;

  return (
    <AppShell title="Stock Overview" breadcrumbs={breadcrumbs}>
      <Head title="Inventory Stock Overview - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Stock Overview & SOH Control</h1>
          <p className="text-xs text-slate-500">Real-time Stock On Hand (SOH), Min/Max thresholds, and stock entry management.</p>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => openStockIn()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Stock In</span>
            </button>

            <button
              onClick={() => openAdj()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Stock Adjustment</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Inventory Catalog SOH List</h2>
          </div>
        </div>

        {materialList.length > 0 ? (
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
                {materialList.map((mat) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-lg p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Stock In Entry</h3>
                <p className="text-xs text-slate-500">Record incoming stock batch to inventory catalog.</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase rounded-full">
                STOCK_IN
              </span>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-4">
              {/* Material Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Material <span className="text-red-600">*</span>
                </label>
                <select
                  value={stockInForm.data.material_id}
                  onChange={(e) => handleMaterialChangeForStockIn(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                >
                  <option value="">-- Choose Material --</option>
                  {materialList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.material_number} - {m.description} ({m.uom})
                    </option>
                  ))}
                </select>
                {stockInForm.errors.material_id && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{stockInForm.errors.material_id}</p>
                )}
              </div>

              {/* Material Info Card */}
              {selectedMat && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-700">{selectedMat.material_number}</span>
                    <StockStatusBadge soh={currentSohIn} minStock={parseFloat(selectedMat.minimum_stock || 0)} />
                  </div>
                  <div className="text-slate-900 font-medium">{selectedMat.description}</div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Category: {selectedMat.category?.name || '-'}</span>
                    <span>UoM: <strong className="text-slate-800">{selectedMat.uom}</strong></span>
                    <span>Current SOH: <strong className="text-slate-900 font-mono">{currentSohIn.toFixed(2)}</strong></span>
                  </div>
                </div>
              )}

              {/* Quantity & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity In <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 25"
                    value={stockInForm.data.quantity || stockInForm.data.qty}
                    onChange={(e) => {
                      stockInForm.setData('quantity', e.target.value);
                      stockInForm.setData('qty', e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white font-mono border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                  {(stockInForm.errors.quantity || stockInForm.errors.qty) && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{stockInForm.errors.quantity || stockInForm.errors.qty}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={stockInForm.data.transaction_date}
                    onChange={(e) => stockInForm.setData('transaction_date', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                  {stockInForm.errors.transaction_date && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{stockInForm.errors.transaction_date}</p>
                  )}
                </div>
              </div>

              {/* Live Preview Card */}
              {selectedMat && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md text-xs space-y-1">
                  <div className="font-bold text-emerald-900 text-[11px] uppercase tracking-wider">Live Stock Preview</div>
                  <div className="flex justify-between items-center text-slate-700 font-mono">
                    <span>Current Stock: <strong>{currentSohIn.toFixed(2)} {selectedMat.uom}</strong></span>
                    <span className="text-emerald-700 font-bold">+{(isNaN(qtyInInput) ? 0 : qtyInInput).toFixed(2)}</span>
                    <span>Final Stock: <strong className="text-emerald-900">{finalStockInPreview.toFixed(2)} {selectedMat.uom}</strong></span>
                  </div>
                </div>
              )}

              {/* Reference & Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reference No (PO / DO / GRN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PO-2026-001"
                    value={stockInForm.data.reference_no}
                    onChange={(e) => stockInForm.setData('reference_no', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                  {stockInForm.errors.reference_no && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{stockInForm.errors.reference_no}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. PT Supplier Utama"
                    value={stockInForm.data.supplier}
                    onChange={(e) => stockInForm.setData('supplier', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Storage Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location</label>
                <input
                  type="text"
                  placeholder="e.g. RACK-A1"
                  value={stockInForm.data.storage_location}
                  onChange={(e) => stockInForm.setData('storage_location', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note / Description</label>
                <textarea
                  rows="2"
                  placeholder="Optional notes for this stock entry..."
                  value={stockInForm.data.note}
                  onChange={(e) => stockInForm.setData('note', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={stockInForm.processing}
                  onClick={() => setStockInModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-md font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stockInForm.processing || !selectedMat || qtyInInput <= 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-md font-semibold shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {stockInForm.processing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Stock In</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-lg p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Stock Physical Adjustment</h3>
                <p className="text-xs text-slate-500">Correct inventory balance based on physical stock take.</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase rounded-full">
                ADJUSTMENT
              </span>
            </div>

            <form onSubmit={handleAdjSubmit} className="space-y-4">
              {/* Material Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Material <span className="text-red-600">*</span>
                </label>
                <select
                  value={adjForm.data.material_id}
                  onChange={(e) => handleMaterialChangeForAdj(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                >
                  <option value="">-- Choose Material --</option>
                  {materialList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.material_number} - {m.description} ({m.uom})
                    </option>
                  ))}
                </select>
                {adjForm.errors.material_id && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{adjForm.errors.material_id}</p>
                )}
              </div>

              {/* Material Info Card */}
              {selectedMat && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-700">{selectedMat.material_number}</span>
                    <StockStatusBadge soh={currentSohAdj} minStock={parseFloat(selectedMat.minimum_stock || 0)} />
                  </div>
                  <div className="text-slate-900 font-medium">{selectedMat.description}</div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Category: {selectedMat.category?.name || '-'}</span>
                    <span>UoM: <strong className="text-slate-800">{selectedMat.uom}</strong></span>
                    <span>Current Stock: <strong className="text-slate-900 font-mono">{currentSohAdj.toFixed(2)}</strong></span>
                  </div>
                </div>
              )}

              {/* Adjustment Quantity & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adjustment Quantity (+ / -) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. +20 or -15"
                    value={adjForm.data.adjustment_quantity}
                    onChange={(e) => adjForm.setData('adjustment_quantity', e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-white font-mono font-bold border rounded-md focus:outline-none ${
                      isAdjNegative
                        ? 'border-red-500 focus:border-red-600 text-red-700 bg-red-50/30'
                        : 'border-slate-300 focus:border-red-600 text-slate-900'
                    }`}
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Use positive for increase (+20), negative for decrease (-15).</p>
                  {adjForm.errors.adjustment_quantity && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{adjForm.errors.adjustment_quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={adjForm.data.transaction_date}
                    onChange={(e) => adjForm.setData('transaction_date', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                  {adjForm.errors.transaction_date && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{adjForm.errors.transaction_date}</p>
                  )}
                </div>
              </div>

              {/* Live Preview Card */}
              {selectedMat && (
                <div
                  className={`p-3 rounded-md text-xs space-y-1.5 border ${
                    isAdjNegative
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : isAdjZero
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="font-bold text-[11px] uppercase tracking-wider">Calculated Final Stock Preview</div>
                  <div className="flex justify-between items-center font-mono">
                    <span>Current: <strong>{currentSohAdj.toFixed(2)}</strong></span>
                    <span>
                      Adjustment:{' '}
                      <strong className={adjQtyInput > 0 ? 'text-emerald-700' : adjQtyInput < 0 ? 'text-red-700' : 'text-slate-600'}>
                        {adjQtyInput > 0 ? `+${adjQtyInput.toFixed(2)}` : adjQtyInput.toFixed(2)}
                      </strong>
                    </span>
                    <span>
                      Final Stock:{' '}
                      <strong className={isAdjNegative ? 'text-red-700 font-bold' : 'text-slate-900 font-bold'}>
                        {finalStockAdjPreview.toFixed(2)} {selectedMat.uom}
                      </strong>
                    </span>
                  </div>

                  {isAdjNegative && (
                    <div className="flex items-center space-x-1.5 text-xs text-red-700 font-bold pt-1 border-t border-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Adjustment would result in negative stock. Submission blocked.</span>
                    </div>
                  )}

                  {isAdjZero && !isAdjNegative && (
                    <div className="text-[11px] text-amber-700 font-medium pt-0.5">
                      Enter a non-zero adjustment quantity to modify stock balance.
                    </div>
                  )}
                </div>
              )}

              {/* Discrepancy Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Discrepancy Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows="2"
                  value={adjForm.data.reason}
                  onChange={(e) => adjForm.setData('reason', e.target.value)}
                  placeholder="Mandatory reason for physical stock count discrepancy..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
                {adjForm.errors.reason && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{adjForm.errors.reason}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note / Remark</label>
                <textarea
                  rows="2"
                  value={adjForm.data.note}
                  onChange={(e) => adjForm.setData('note', e.target.value)}
                  placeholder="Optional audit remarks..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={adjForm.processing}
                  onClick={() => setAdjModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-md font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjForm.processing || isAdjNegative || isAdjZero || !selectedMat || !adjForm.data.reason}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-md font-semibold shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {adjForm.processing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Adjustment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
