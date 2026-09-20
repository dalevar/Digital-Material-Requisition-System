import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Users, Plus, Edit } from 'lucide-react';

export default function UsersIndex({ users, roles, departments, plants, approvers }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

  const openCreate = () => {
    setEditingUser(null);
    form.reset();
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
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

  return (
    <AppShell title="User Management">
      <Head title="User Management - DMRS" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage application users, assign roles, departments, plants, and approvers.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Name / Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department / Plant</th>
                <th className="p-4">Approver</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">{u.employee_id}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-slate-400 text-[11px]">{u.username} • {u.email}</div>
                  </td>
                  <td className="p-4 font-bold text-blue-700">{u.role?.name}</td>
                  <td className="p-4">
                    <div>{u.department?.name || '-'}</div>
                    <div className="text-slate-400 text-[11px]">{u.plant?.name || '-'}</div>
                  </td>
                  <td className="p-4">{u.approver?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-4">
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
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={form.data.username}
                    onChange={(e) => form.setData('username', e.target.value)}
                    disabled={!!editingUser}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password {editingUser && '(Leave blank to keep current)'}</label>
                  <input
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={form.data.role_id}
                    onChange={(e) => form.setData('role_id', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  >
                    <option value="">Select Role...</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={form.data.department_id}
                    onChange={(e) => form.setData('department_id', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
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
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
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
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
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
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
