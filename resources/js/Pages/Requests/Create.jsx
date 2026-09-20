import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Plus, Trash2, Save, Send, ArrowLeft } from 'lucide-react';

export default function Create({ materials, approvers, departments, plants }) {
  const { data, setData, post, processing, errors } = useForm({
    no_doc: '',
    request_date: new Date().toISOString().split('T')[0],
    department_id: '',
    plant_id: '',
    gl_account: '',
    pwo_no: '',
    pur_org: '',
    pur_group: '',
    cost_center: '',
    reason: '',
    approver_id: '',
    action: 'draft',
    items: [
      { material_id: '', qty: 1, description: '', uom: '', soh: 0, balance: 0, note: '' }
    ],
  });

  const addItemRow = () => {
    setData('items', [
      ...data.items,
      { material_id: '', qty: 1, description: '', uom: '', soh: 0, balance: 0, note: '' }
    ]);
  };

  const removeItemRow = (index) => {
    if (data.items.length === 1) return;
    const newItems = [...data.items];
    newItems.splice(index, 1);
    setData('items', newItems);
  };

  const handleMaterialChange = (index, materialId) => {
    const selectedMat = materials.find((m) => m.id === parseInt(materialId));
    const newItems = [...data.items];
    if (selectedMat) {
      const soh = parseFloat(selectedMat.soh || 0);
      const qty = parseFloat(newItems[index].qty || 0);
      newItems[index] = {
        ...newItems[index],
        material_id: selectedMat.id,
        description: selectedMat.description,
        uom: selectedMat.uom,
        soh: soh,
        balance: soh - qty,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        material_id: '',
        description: '',
        uom: '',
        soh: 0,
        balance: 0,
      };
    }
    setData('items', newItems);
  };

  const handleQtyChange = (index, qty) => {
    const newItems = [...data.items];
    const parsedQty = parseFloat(qty) || 0;
    const soh = newItems[index].soh || 0;
    newItems[index].qty = parsedQty;
    newItems[index].balance = soh - parsedQty;
    setData('items', newItems);
  };

  const handleItemNoteChange = (index, note) => {
    const newItems = [...data.items];
    newItems[index].note = note;
    setData('items', newItems);
  };

  const handleSubmit = (actionType) => {
    data.action = actionType;
    post('/requests');
  };

  return (
    <AppShell title="Create New Material Requisition">
      <Head title="Create New Request - DMRS" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/requests" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Requests
          </Link>
          <h1 className="text-xl font-bold text-slate-900">New Material Requisition Form (MRF)</h1>
        </div>
      </div>

      <form className="space-y-6">
        {/* Header Metadata Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">MRF Header Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Request Date *</label>
              <input
                type="date"
                value={data.request_date}
                onChange={(e) => setData('request_date', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Reference No (Optional Archive No)</label>
              <input
                type="text"
                value={data.no_doc}
                onChange={(e) => setData('no_doc', e.target.value)}
                placeholder="e.g. DOC-REF-2026-001"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designated Approver (Executive / HoD) *</label>
              <select
                value={data.approver_id}
                onChange={(e) => setData('approver_id', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Approver...</option>
                {approvers.map((appr) => (
                  <option key={appr.id} value={appr.id}>
                    {appr.name} ({appr.position || 'Approver'})
                  </option>
                ))}
              </select>
              {errors.approver_id && <p className="text-xs text-rose-600 mt-1">{errors.approver_id}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={data.department_id}
                onChange={(e) => setData('department_id', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plant</label>
              <select
                value={data.plant_id}
                onChange={(e) => setData('plant_id', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Plant...</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">G/L Account</label>
              <input
                type="text"
                value={data.gl_account}
                onChange={(e) => setData('gl_account', e.target.value)}
                placeholder="e.g. 500120"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PWO No.</label>
              <input
                type="text"
                value={data.pwo_no}
                onChange={(e) => setData('pwo_no', e.target.value)}
                placeholder="e.g. PWO-9941"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pur. Org / Pur. Group</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={data.pur_org}
                  onChange={(e) => setData('pur_org', e.target.value)}
                  placeholder="Pur Org"
                  className="w-1/2 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={data.pur_group}
                  onChange={(e) => setData('pur_group', e.target.value)}
                  placeholder="Pur Group"
                  className="w-1/2 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center</label>
              <input
                type="text"
                value={data.cost_center}
                onChange={(e) => setData('cost_center', e.target.value)}
                placeholder="e.g. CC-304"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Purpose for Requisition</label>
            <textarea
              rows="2"
              value={data.reason}
              onChange={(e) => setData('reason', e.target.value)}
              placeholder="Provide reason or operational purpose..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dynamic Material Items Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Material Items</h2>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Material Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3 style-width: 5%">No</th>
                  <th className="p-3 style-width: 30%">Material *</th>
                  <th className="p-3 text-right style-width: 12%">SOH</th>
                  <th className="p-3 text-right style-width: 12%">Request Qty *</th>
                  <th className="p-3 text-center style-width: 8%">UoM</th>
                  <th className="p-3 text-right style-width: 12%">Est. Balance</th>
                  <th className="p-3 style-width: 16%">Notes</th>
                  <th className="p-3 text-center style-width: 5%">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="p-3 text-center font-bold text-slate-500">{index + 1}</td>
                    <td className="p-3">
                      <select
                        value={item.material_id}
                        onChange={(e) => handleMaterialChange(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Material...</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.material_number} - {m.description}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-700">{item.soh.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.qty}
                        onChange={(e) => handleQtyChange(index, e.target.value)}
                        className="w-24 text-right px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                        required
                      />
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-500">{item.uom || '-'}</td>
                    <td className={`p-3 text-right font-bold ${item.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {item.balance.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => handleItemNoteChange(index, e.target.value)}
                        placeholder="Item note..."
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={data.items.length === 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={processing}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('submit')}
            disabled={processing}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Approval</span>
          </button>
        </div>
      </form>
    </AppShell>
  );
}
