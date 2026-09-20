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

export default function Categories({ categories = { data: [] }, filters = {} }) {
  const breadcrumbs = [
    { title: 'System Administration', href: '/admin/dashboard' },
    { title: 'Material Categories', href: null },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    code: '',
    name: '',
    is_active: true,
  });

  const applyFilters = useCallback(() => {
    router.get(
      '/admin/categories',
      {
        search: search || undefined,
        status: statusFilter || undefined,
      },
      { preserveScroll: true, preserveState: true }
    );
  }, [search, statusFilter]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    router.get('/admin/categories', {}, { preserveScroll: true });
  };

  const openCreateModal = () => {
    setEditingCat(null);
    reset();
    clearErrors();
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    clearErrors();
    setData({
      code: cat.code,
      name: cat.name,
      is_active: Boolean(cat.is_active),
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCat) {
      put(`/admin/categories/${editingCat.id}`, {
        onSuccess: () => setModalOpen(false),
      });
    } else {
      post('/admin/categories', {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const items = categories?.data ?? [];
  const meta = categories?.meta ?? categories;

  return (
    <AppShell title="Material Categories" breadcrumbs={breadcrumbs}>
      <Head title="Material Categories - DMRS" />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Material Categories Master Data</h1>
          <p className="text-xs text-slate-500">Manage classification categories for master materials.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs mb-4 p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Search by code or category name…"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={applyFilters}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors"
          >
            Search
          </button>
          {(search || statusFilter) && (
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-red-700">{cat.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{cat.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1 text-slate-500 hover:text-red-600 transition-colors"
                        title="Edit Category"
                      >
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
            title="No material categories found"
            description={search || statusFilter ? "No categories match your criteria." : "Click 'Add New Category' to register material categories."}
          />
        )}
        <Pagination meta={meta} />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingCat ? 'Edit Material Category' : 'Add New Material Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value)}
                  placeholder="e.g. CAT-MECH"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
                {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g. Mechanical & Piping"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={data.is_active ? '1' : '0'}
                  onChange={(e) => setData('is_active', e.target.value === '1')}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                >
                  <option value="1">ACTIVE</option>
                  <option value="0">INACTIVE</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-xs"
                >
                  {processing ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
