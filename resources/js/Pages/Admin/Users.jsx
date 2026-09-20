import React, { useState, useCallback } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import EmptyState from '@/Components/EmptyState';
import { Users as UsersIcon, Plus, Edit, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function UsersIndex({ users, roles = [], departments = [], plants = [], approvers = [], filters = {} }) {
  const breadcrumbs = [
    { title: 'System Administration', href: '/admin/dashboard' },
    { title: 'User Management', href: null },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState(filters.search ?? '');
  const [roleFilter, setRoleFilter] = useState(filters.role_id ?? '');
  const [deptFilter, setDeptFilter] = useState(filters.department_id ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
  const [showFilters, setShowFilters] = useState(false);

  const form = useForm({
    employee_id: '',
    username: '',
    name: '',
    email: '',
    password: '',
    role_id: '',
    department_id: '',
    plant_id: '',
    approver_id: '',
    position: '',
    status: 'ACTIVE',
  });

  const activeFilterCount = [roleFilter, deptFilter, statusFilter].filter(Boolean).length;

  const applyFilters = useCallback(() => {
    router.get(
      '/admin/users',
      {
        search: search || undefined,
        role_id: roleFilter || undefined,
        department_id: deptFilter || undefined,
        status: statusFilter || undefined,
      },
      { preserveScroll: true, preserveState: true }
    );
  }, [search, roleFilter, deptFilter, statusFilter]);

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setDeptFilter('');
    setStatusFilter('');
    router.get('/admin/users', {}, { preserveScroll: true });
  };

  const openCreate = () => {
    setEditingUser(null);
    form.reset();
    form.clearErrors();
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    form.clearErrors();
    form.setData({
      employee_id: u.employee_id,
      username: u.username,
      name: u.name,
      email: u.email,
      password: '',
      role_id: u.role_id,
      department_id: u.department_id || '',
      plant_id: u.plant_id || '',
      approver_id: u.approver_id || '',
      position: u.position || '',
      status: u.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      form.put(`/admin/users/${editingUser.id}`, {
        onSuccess: () => setModalOpen(false),
      });
    } else {
      form.post('/admin/users', {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const data = users?.data ?? [];
  const meta = users?.meta ?? users;

  return (
    <AppShell title="User Management" breadcrumbs={breadcrumbs}>
      <Head title="User Management - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage application users, assign roles, departments, plants, and approvers.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
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
              placeholder="Search by name, username, email, or employee ID…"
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
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

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Employee ID</th>
                  <th className="p-3.5">Name / Username</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Department / Plant</th>
                  <th className="p-3.5">Approver</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{u.employee_id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.username} • {u.email}</div>
                    </td>
                    <td className="p-3.5 font-bold text-red-600">{u.role?.name}</td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{u.department?.name || '-'}</div>
                      <div className="text-slate-400 text-[11px]">{u.plant?.name || '-'}</div>
                    </td>
                    <td className="p-3.5 text-slate-700">{u.approver?.name || '-'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Edit User">
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
            icon={UsersIcon}
            title="No users found"
            description={search || activeFilterCount > 0 ? "No users match your criteria." : "No users exist in the system."}
          />
        )}
        <Pagination meta={meta} />
      </div>

      {/* User Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-lg w-full rounded-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">{editingUser ? 'Edit User' : 'Create User'}</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    value={form.data.employee_id}
                    onChange={(e) => form.setData('employee_id', e.target.value)}
                    disabled={!!editingUser}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md disabled:opacity-50"
                    required
                  />
                  {form.errors.employee_id && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.employee_id}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={form.data.username}
                    onChange={(e) => form.setData('username', e.target.value)}
                    disabled={!!editingUser}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md disabled:opacity-50"
                    required
                  />
                  {form.errors.username && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.username}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                    required
                  />
                  {form.errors.name && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.name}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                    required
                  />
                  {form.errors.email && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.email}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password {editingUser ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                    required={!editingUser}
                  />
                  {form.errors.password && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.password}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={form.data.role_id}
                    onChange={(e) => form.setData('role_id', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                    required
                  >
                    <option value="">Select Role...</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  {form.errors.role_id && <div className="text-red-500 text-[10px] mt-0.5">{form.errors.role_id}</div>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={form.data.department_id}
                    onChange={(e) => form.setData('department_id', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Plant</label>
                  <select
                    value={form.data.plant_id}
                    onChange={(e) => form.setData('plant_id', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <option value="">Select Plant...</option>
                    {plants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Approver</label>
                  <select
                    value={form.data.approver_id}
                    onChange={(e) => form.setData('approver_id', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <option value="">Select Approver...</option>
                    {approvers.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status *</label>
                  <select
                    value={form.data.status}
                    onChange={(e) => form.setData('status', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs rounded-md font-semibold text-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={form.processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md font-semibold shadow-xs transition-colors">
                  {form.processing ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
