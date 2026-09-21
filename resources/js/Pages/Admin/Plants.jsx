import React, { useState, useCallback } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import EmptyState from '@/Components/EmptyState';
import ConfirmationModal from '@/Components/ConfirmationModal';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Factory, Plus, Edit, Search, Filter, X, ChevronLeft, ChevronRight, Power, PowerOff, Trash2 } from 'lucide-react';

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

export default function Plants({ plants = { data: [] }, filters = {} }) {
  const breadcrumbs = [
    { title: 'System Management', href: '/admin/dashboard' },
    { title: 'Plants', href: null },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [togglePlant, setTogglePlant] = useState(null);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [deletePlant, setDeletePlant] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openDeleteModal = (plant) => {
    setDeletePlant(plant);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletePlant) return;
    setDeleting(true);
    router.delete(`/admin/plants/${deletePlant.id}`, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setDeletePlant(null);
      },
      onFinish: () => setDeleting(false),
    });
  };
  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    code: '',
    name: '',
    location: '',
    is_active: true,
  });

  const applyFilters = useCallback(() => {
    router.get(
      '/admin/plants',
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
    router.get('/admin/plants', {}, { preserveScroll: true });
  };

  const openCreateModal = () => {
    setEditingPlant(null);
    reset();
    clearErrors();
    setModalOpen(true);
  };

  const openEditModal = (plant) => {
    setEditingPlant(plant);
    clearErrors();
    setData({
      code: plant.code,
      name: plant.name,
      location: plant.location || '',
      is_active: Boolean(plant.is_active),
    });
    setModalOpen(true);
  };

  const openToggleModal = (plant) => {
    setTogglePlant(plant);
    setToggleModalOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!togglePlant) return;
    router.put(
      `/admin/plants/${togglePlant.id}`,
      {
        code: togglePlant.code,
        name: togglePlant.name,
        location: togglePlant.location,
        is_active: !togglePlant.is_active,
      },
      {
        onSuccess: () => {
          setToggleModalOpen(false);
          setTogglePlant(null);
        },
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPlant) {
      put(`/admin/plants/${editingPlant.id}`, {
        onSuccess: () => setModalOpen(false),
      });
    } else {
      post('/admin/plants', {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const items = plants?.data ?? [];
  const meta = plants?.meta ?? plants;

  return (
    <AppShell title="Plants Master Data" breadcrumbs={breadcrumbs}>
      <Head title="Plants - DMRS" />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Plants & Facilities Master Data</h1>
          <p className="text-xs text-slate-500">Manage plant locations and operational sites.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plant</span>
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
            placeholder="Search by code, plant name, or location…"
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
                  <th className="px-4 py-3">Plant Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-red-700">{p.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.location || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 text-slate-500 hover:text-red-600 transition-colors"
                        title="Edit Plant"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openToggleModal(p)}
                        className={`p-1 transition-colors ${
                          p.is_active
                            ? 'text-slate-500 hover:text-rose-600'
                            : 'text-slate-500 hover:text-emerald-600'
                        }`}
                        title={p.is_active ? 'Deactivate Plant' : 'Activate Plant'}
                      >
                        {p.is_active ? <PowerOff className="w-4 h-4 text-rose-600" /> : <Power className="w-4 h-4 text-emerald-600" />}
                      </button>

                      <button
                        onClick={() => openDeleteModal(p)}
                        className="p-1 text-slate-500 hover:text-red-700 transition-colors"
                        title="Delete Plant"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Factory}
            title="No plants found"
            description={search || statusFilter ? 'No plants match your criteria.' : "Click 'Add New Plant' to register plant locations."}
          />
        )}
        <Pagination meta={meta} />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingPlant ? 'Edit Plant' : 'Add New Plant'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value)}
                  placeholder="e.g. PLR-01"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
                {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g. Pulau Laut Refinery"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData('location', e.target.value)}
                  placeholder="e.g. Kota Baru, South Kalimantan"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                />
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
                  {processing ? 'Saving...' : 'Save Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Activate/Deactivate */}
      <ConfirmationModal
        isOpen={toggleModalOpen}
        onClose={() => setToggleModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={togglePlant?.is_active ? 'Deactivate Plant' : 'Activate Plant'}
        description={`Are you sure you want to ${
          togglePlant?.is_active ? 'deactivate' : 'activate'
        } plant ${togglePlant?.name} (${togglePlant?.code})?`}
        confirmText={togglePlant?.is_active ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={togglePlant?.is_active ? 'danger' : 'success'}
      />
      {/* Delete Plant Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Plant"
        description="Are you sure you want to permanently delete this plant location?"
        itemName={deletePlant ? `${deletePlant.name} (${deletePlant.code})` : ''}
        processing={deleting}
      />
    </AppShell>
  );
}
