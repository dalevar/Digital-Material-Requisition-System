import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { Package, Plus, Edit } from 'lucide-react';

export default function MaterialsIndex({ materials, categories, plants }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState(null);

  const form = useForm({
    material_number: '',
    description: '',
    category_id: '',
    uom: '',
    minimum_stock: 0,
    maximum_stock: 100,
    storage_location: '',
    plant_id: '',
    status: 'ACTIVE',
    initial_stock: 0,
  });

  const openCreate = () => {
    setEditingMat(null);
    form.reset();
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditingMat(m);
    form.setData({
      material_number: m.material_number,
      description: m.description,
      category_id: m.category_id,
      uom: m.uom,
      minimum_stock: m.minimum_stock,
      maximum_stock: m.maximum_stock,
      storage_location: m.storage_location || '',
      plant_id: m.plant_id || '',
      status: m.status,
      initial_stock: 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMat) {
      form.put(`/admin/materials/${editingMat.id}`, {
        onSuccess: () => setModalOpen(false),
      });
    } else {
      form.post('/admin/materials', {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  return (
    <AppShell title="Master Materials">
      <Head title="Master Materials - DMRS" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Master Material Catalogue</h1>
          <p className="text-xs text-slate-500 mt-1">Manage master material items, categories, reorder levels, and storage locations.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material Master</span>
        </button>
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
                <th className="p-4 text-right">Min Stock</th>
                <th className="p-4 text-right">Current SOH</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.data.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">{m.material_number}</td>
                  <td className="p-4 font-medium text-slate-800">{m.description}</td>
                  <td className="p-4">{m.category?.name || '-'}</td>
                  <td className="p-4 text-center">{m.uom}</td>
                  <td className="p-4 text-right">{parseFloat(m.minimum_stock).toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-slate-900">{parseFloat(m.stock_balance?.quantity || 0).toFixed(2)}</td>
                  <td className="p-4">{m.storage_location || '-'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(m)} className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">{editingMat ? 'Edit Material Master' : 'Add Material Master'}</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Material Number *</label>
                  <input
                    type="text"
                    value={form.data.material_number}
                    onChange={(e) => form.setData('material_number', e.target.value)}
                    disabled={!!editingMat}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.data.category_id}
                    onChange={(e) => form.setData('category_id', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description *</label>
                  <input
                    type="text"
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">UoM *</label>
                  <input
                    type="text"
                    value={form.data.uom}
                    onChange={(e) => form.setData('uom', e.target.value)}
                    placeholder="e.g. PCS, DRUM, MTR"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={form.data.storage_location}
                    onChange={(e) => form.setData('storage_location', e.target.value)}
                    placeholder="e.g. RACK-A1"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Minimum Stock *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.data.minimum_stock}
                    onChange={(e) => form.setData('minimum_stock', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Maximum Stock *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.data.maximum_stock}
                    onChange={(e) => form.setData('maximum_stock', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                {!editingMat && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Initial Stock Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.data.initial_stock}
                      onChange={(e) => form.setData('initial_stock', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status *</label>
                  <select
                    value={form.data.status}
                    onChange={(e) => form.setData('status', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={form.processing} className="px-4 py-2 bg-blue-700 text-white text-xs rounded-xl font-semibold">
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
