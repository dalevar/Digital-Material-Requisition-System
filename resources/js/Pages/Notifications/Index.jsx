import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Bell, CheckCheck, FileText, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function Index({ notifications }) {
  const breadcrumbs = [
    { title: 'Notifications', href: null },
  ];

  const handleMarkAsRead = (id) => {
    router.post(`/notifications/${id}/read`);
  };

  const handleMarkAllAsRead = () => {
    router.post('/notifications/read-all');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'PENDING_APPROVAL':
        return <Bell className="w-4 h-4 text-orange-600" />;
      case 'REQUEST_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'REQUEST_REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'REQUEST_CANCELLED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <AppShell title="Notifications" breadcrumbs={breadcrumbs}>
      <Head title="Notifications - DMRS" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications Center</h1>
          <p className="text-xs text-slate-500">View real-time requisition updates, approvals, and system alerts.</p>
        </div>

        {notifications?.data?.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {notifications?.data && notifications.data.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {notifications.data.map((n) => (
              <div
                key={n.id}
                className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                  n.is_read ? 'bg-white' : 'bg-red-50/20 border-l-4 border-l-red-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-slate-100 mt-0.5 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">{n.title}</h2>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-400 mt-1 font-medium">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {n.metadata?.request_id && (
                    <Link
                      href={`/requests/${n.metadata.request_id}`}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Request</span>
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No notifications found.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
