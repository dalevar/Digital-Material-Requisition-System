import React, { useState, useCallback } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import EmptyState from '@/Components/EmptyState';
import { Package, Plus, Edit, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function MaterialsIndex({ materials = { data: [] }, categories = [], plants = [], filters = {} }) {
  const breadcrumbs = [
    { title: 'System Administration', href: '/admin/dashboard' },
    { title: 'Master Materials', href: null },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState(null);
  const [search, setSearch] = useState(filters.search ?? '');
  const [catFilter, setCatFilter] = useState(filters.category_id ?? '');
  const [plantFilter, setPlantFilter] = useState(filters.plant_id ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
  const [showFilters, setShowFilters] = useState(false);

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

  const activeFilterCount = [catFilter, plantFilter, statusFilter].filter(Boolean).length;

  const applyFilters = useCallback(() => {
    router.get(
      '/admin/materials',
      {
        search: search || undefined,
        category_id: catFilter || undefined,
        plant_id: plantFilter || undefined,
        status: statusFilter || undefined,
      },
      { preserveScroll: true, preserveState: true }
    );
  }, [search, catFilter, plantFilter, statusFilter]);

  const resetFilters = () => {
    setSearch('');
    setCatFilter('');
    setPlantFilter('');
    setStatusFilter('');
    router.get('/admin/materials', {}, { preserveScroll: true });
  };

  const openCreate = () => {
    setEditingMat(null);
    form.reset();
    form.clearErrors();
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditingMat(m);
    form.clearErrors();
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

  const data = materials?.data ?? [];
  const meta = materials?.meta ?? materials;

  return (
    <AppShell title="Master Materials" breadcrumbs={breadcrumbs}>
      <Head title="Master Materials - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Material Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage master material items, categories, reorder levels, and storage locations.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material Master</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs mb-4">
        <div className="p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Search by material number or description…"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={applyFilters}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            </button>
            {(search || activeFilterCount > 0) && (
              <button
                onClick={resetFilters}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-slate-200 p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plant</label>
              <select
                value={plantFilter}
                onChange={(e) => setPlantFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Plants</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Material No</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">UoM</th>
                  <th className="px-4 py-3 text-right">Min Stock</th>
                  <th className="px-4 py-3 text-right">Current SOH</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((m) => (
                  <tr key={m.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-700">{m.material_number}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{m.description}</td>
                    <td className="px-4 py-3 text-slate-600">{m.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-500">{m.uom}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{parseFloat(m.minimum_stock).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{parseFloat(m.stock_balance?.quantity || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">{m.storage_location || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors" title="Edit Material">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No material master records"
            description={search || activeFilterCount > 0 ? "No materials match your criteria." : "Click 'Add Material Master' to register new material items in the system."}
          />
        )}
        <Pagination meta={meta} />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-lg w-full rounded-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">{editingMat ? 'Edit Material Master' : 'Add Material Master'}</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Material Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.data.material_number}
                    onChange={(e) => form.setData('material_number', e.target.value)}
                    disabled={!!editingMat}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none disabled:bg-slate-100"
                    required
                  />
                  {form.errors.material_number && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.material_number}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.data.category_id}
                    onChange={(e) => form.setData('category_id', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {form.errors.category_id && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.category_id}</div>}
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                  {form.errors.description && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.description}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    UoM <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.data.uom}
                    onChange={(e) => form.setData('uom', e.target.value)}
                    placeholder="e.g. PCS, DRUM, MTR"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                  {form.errors.uom && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.uom}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={form.data.storage_location}
                    onChange={(e) => form.setData('storage_location', e.target.value)}
                    placeholder="e.g. RACK-A1"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Minimum Stock <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.data.minimum_stock}
                    onChange={(e) => form.setData('minimum_stock', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Maximum Stock <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.data.maximum_stock}
                    onChange={(e) => form.setData('maximum_stock', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
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
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.data.status}
                    onChange={(e) => form.setData('status', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs rounded-md font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={form.processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md font-semibold shadow-xs">
                  {form.processing ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
