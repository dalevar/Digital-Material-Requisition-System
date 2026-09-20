import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  ClipboardCheck,
  History,
  FileBarChart,
  ShieldCheck,
  Users,
  LogOut,
  Menu,
  X,
  Building2,
  Factory,
} from 'lucide-react';

export default function AppShell({ children, title }) {
  const pageProps = usePage().props || {};
  const auth = pageProps.auth || {};
  const flash = pageProps.flash || {};
  const user = auth.user || null;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    router.post('/logout');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Material Requests', href: '/requests', icon: FileText, show: true },
    { name: 'Approval Inbox', href: '/approvals/inbox', icon: ClipboardCheck, show: user?.role === 'APPROVER' || user?.role === 'ADMIN' },
    { name: 'Stock Overview', href: '/inventory/overview', icon: Boxes, show: true },
    { name: 'Stock History', href: '/inventory/history', icon: History, show: true },
    { name: 'Request Report', href: '/reports/requests', icon: FileBarChart, show: user?.role === 'ADMIN' || user?.role === 'APPROVER' },
    { name: 'Stock Report', href: '/reports/stock', icon: FileBarChart, show: user?.role === 'ADMIN' },
    { name: 'User Management', href: '/admin/users', icon: Users, show: user?.role === 'ADMIN' },
    { name: 'Master Materials', href: '/admin/materials', icon: Package, show: user?.role === 'ADMIN' },
    { name: 'Audit Trail', href: '/admin/audit-logs', icon: ShieldCheck, show: user?.role === 'ADMIN' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Topbar (64px) */}
      <header className="h-16 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 lg:px-6 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-xs">
              DMRS
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 leading-tight">PT. Guthrie International</h1>
              <p className="text-xs text-slate-500 font-medium">Pulau Laut Refinery</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{user?.department?.name || 'Department'}</span>
            <span className="text-slate-300">|</span>
            <Factory className="w-3.5 h-3.5 text-blue-600" />
            <span>{user?.plant?.name || 'PLR-01'}</span>
          </div>

          <div className="relative flex items-center space-x-3 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{user?.name || 'Loading user...'}</div>
              <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">{user?.role || 'USER'}</div>
            </div>

            {user && (
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar (240px) */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-20 w-60 bg-white border-r border-slate-200 pt-4 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="px-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>

            {navItems.filter((item) => item.show).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-blue-700 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[11px] text-slate-400 text-center font-medium">
              DMRS v1.5 • Guthrie Refinery
            </div>
          </div>
        </aside>

        {/* Main Content Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {flash?.success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs">
              <span>{flash.success}</span>
            </div>
          )}

          {flash?.error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between shadow-xs">
              <span>{flash.error}</span>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
