import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { User, KeyRound, Building2, Factory, ShieldCheck, Check } from 'lucide-react';

export default function Show({ userProfile }) {
  const breadcrumbs = [
    { title: 'User Profile', href: null },
  ];

  const profileForm = useForm({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    position: userProfile?.position || '',
  });

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileForm.put('/profile');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    passwordForm.put('/profile/password', {
      onSuccess: () => passwordForm.reset(),
    });
  };

  return (
    <AppShell title="User Profile" breadcrumbs={breadcrumbs}>
      <Head title="My Profile - DMRS" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Settings & Profile</h1>
        <p className="text-xs text-slate-500">View corporate account assignment and update personal settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Corporate Assignment Summary Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6 h-fit">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center justify-center font-bold text-lg">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{userProfile?.name}</h2>
              <p className="text-xs text-red-700 font-bold uppercase tracking-wider">{userProfile?.role?.name || 'USER'}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Employee ID</span>
              <span className="font-mono font-bold text-slate-900">{userProfile?.employee_id}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Username</span>
              <span className="font-mono font-bold text-slate-800">{userProfile?.username}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Department</span>
              <span className="font-semibold text-slate-800">{userProfile?.department?.name || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Plant Location</span>
              <span className="font-semibold text-slate-800">{userProfile?.plant?.name || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Assigned Approver</span>
              <span className="font-semibold text-slate-800">{userProfile?.approver?.name || '-'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Update Profile & Change Password Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Personal Information
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.data.name}
                    onChange={(e) => profileForm.setData('name', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                  {profileForm.errors.name && <p className="text-xs text-red-600 mt-1">{profileForm.errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={profileForm.data.email}
                    onChange={(e) => profileForm.setData('email', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                  {profileForm.errors.email && <p className="text-xs text-red-600 mt-1">{profileForm.errors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Position</label>
                  <input
                    type="text"
                    value={profileForm.data.position}
                    onChange={(e) => profileForm.setData('position', e.target.value)}
                    placeholder="e.g. Senior Field Technician"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileForm.processing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors"
                >
                  Save Profile Edits
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Security & Password Update
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.data.current_password}
                  onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
                {passwordForm.errors.current_password && (
                  <p className="text-xs text-red-600 mt-1">{passwordForm.errors.current_password}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.data.password}
                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                  {passwordForm.errors.password && (
                    <p className="text-xs text-red-600 mt-1">{passwordForm.errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.data.password_confirmation}
                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordForm.processing}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
