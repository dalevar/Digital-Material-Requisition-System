import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { PlusCircle, Search, Filter, FileText, Download, FilePlus, X, Edit, Trash2, Send, AlertTriangle, Info } from 'lucide-react';

export default function Index({
  requests = { data: [] },
  filters = {},
  departments = [],
  plants = [],
  approvers = [],
}) {
  const { auth } = usePage().props;
  const user = auth.user;

  const breadcrumbs = [
    { title: 'Material Requests', href: null },
  ];

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteProcessing, setDeleteProcessing] = useState(false);
  const [submitTarget, setSubmitTarget] = useState(null);
  const [submitProcessing, setSubmitProcessing] = useState(false);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteProcessing(true);
    router.delete(`/requests/${deleteTarget.id}`, {
      onFinish: () => {
        setDeleteProcessing(false);
        setDeleteTarget(null);
      },
    });
  };

  const handleConfirmSubmit = () => {
    if (!submitTarget) return;
    setSubmitProcessing(true);
    router.post(
      `/requests/${submitTarget.id}/submit`,
      {},
      {
        onFinish: () => {
          setSubmitProcessing(false);
          setSubmitTarget(null);
        },
      }
    );
  };

  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [departmentId, setDepartmentId] = useState(filters.department_id || '');
  const [plantId, setPlantId] = useState(filters.plant_id || '');
  const [approverId, setApproverId] = useState(filters.approver_id || '');
  const [noDoc, setNoDoc] = useState(filters.no_doc || '');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(filters.department_id || filters.plant_id || filters.approver_id || filters.no_doc || filters.date_from || filters.date_to)
  );

  const handleFilter = (e) => {
    if (e) e.preventDefault();
    router.get(
      '/requests',
      {
        search: search || undefined,
        status: status || undefined,
        department_id: departmentId || undefined,
        plant_id: plantId || undefined,
        approver_id: approverId || undefined,
        no_doc: noDoc || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
      { preserveState: true }
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setDepartmentId('');
    setPlantId('');
    setApproverId('');
    setNoDoc('');
    setDateFrom('');
    setDateTo('');
    router.get('/requests', {}, { preserveState: true });
  };

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled (Post-Approval)', value: 'CANCELLED_AFTER_APPROVAL' },
  ];

  const activeAdvancedCount = [departmentId, plantId, approverId, noDoc, dateFrom, dateTo].filter(Boolean).length;

  return (
    <AppShell title="Material Requisitions" breadcrumbs={breadcrumbs}>
      <Head title="Material Requisitions - DMRS" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Material Requisition Forms (MRF)</h1>
          <p className="text-xs text-slate-500">Browse, filter, track status, and manage material requisitions.</p>
        </div>
        <Link
          href="/requests/create"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Requisition</span>
        </Link>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {statusOptions.map((opt) => {
          const isActive = status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                setStatus(opt.value);
                router.get(
                  '/requests',
                  {
                    ...(search ? { search } : {}),
                    ...(opt.value ? { status: opt.value } : {}),
                    ...(departmentId ? { department_id: departmentId } : {}),
                    ...(plantId ? { plant_id: plantId } : {}),
                    ...(approverId ? { approver_id: approverId } : {}),
                    ...(noDoc ? { no_doc: noDoc } : {}),
                    ...(dateFrom ? { date_from: dateFrom } : {}),
                    ...(dateTo ? { date_to: dateTo } : {}),
                  },
                  { preserveState: true }
                );
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs mb-6 space-y-3">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            <div className="relative min-w-[260px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Request No, Doc Reference, Requester, Material..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-3.5 py-2 border rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                showAdvanced || activeAdvancedCount > 0
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters{activeAdvancedCount > 0 ? ` (${activeAdvancedCount})` : ''}</span>
            </button>

            {(search || status || activeAdvancedCount > 0) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-md transition-colors flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plant</label>
              <select
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Plants</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Approver</label>
              <select
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Approvers</option>
                {approvers.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Document No</label>
              <input
                type="text"
                value={noDoc}
                onChange={(e) => setNoDoc(e.target.value)}
                placeholder="Doc reference no..."
                className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}
      </form>

      {/* Requests Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {requests.data && requests.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Request No</th>
                  <th className="px-4 py-3">Doc Reference</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.data.map((req) => {
                  const isDraft = req.status === 'DRAFT';
                  const canEdit = isDraft && (user?.role === 'ADMIN' || user?.id === req.requester_id);
                  const canSubmit = isDraft && (user?.role === 'ADMIN' || user?.id === req.requester_id);
                  const canDelete = isDraft && (user?.role === 'ADMIN' || (user?.role === 'USER' && user?.id === req.requester_id));

                  return (
                    <tr key={req.id} className="hover:bg-red-50/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-red-700">{req.request_no}</td>
                      <td className="px-4 py-3 font-medium text-slate-500">{req.no_doc || '-'}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{req.requester?.name || '-'}</td>
                      <td className="px-4 py-3">{req.department?.name || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{req.request_date}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <a
                          href={`/requests/${req.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 inline-flex items-center text-slate-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Download Official PDF MRF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/requests/${req.id}`}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-xs transition-colors"
                        >
                          View
                        </Link>
                        {canEdit && (
                          <Link
                            href={`/requests/${req.id}/edit`}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs transition-colors"
                          >
                            Edit
                          </Link>
                        )}
                        {canSubmit && (
                          <button
                            type="button"
                            onClick={() => setSubmitTarget(req)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs transition-colors"
                          >
                            Submit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(req)}
                            className="px-2.5 py-1 border border-red-700 hover:bg-red-700 text-red-700 hover:text-white rounded font-semibold text-xs transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FilePlus}
            title="No material requisitions found"
            description="No requests match your selected search or status filters."
          />
        )}
      </div>

      {/* Delete Draft Request Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Draft Request?"
        description="Are you sure you want to delete this draft?"
        confirmText="Delete Draft"
        cancelText="Cancel"
        variant="danger"
        processing={deleteProcessing}
      >
        {deleteTarget && (
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs mt-2">
            <div>
              <span className="font-semibold text-slate-500">Request Number: </span>
              <span className="font-bold font-mono text-slate-900">{deleteTarget.request_no}</span>
            </div>
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-red-900 text-[11px] font-medium flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>This action cannot be undone.</span>
            </div>
          </div>
        )}
      </ConfirmationModal>

      {/* Submit Draft Request Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(submitTarget)}
        onClose={() => setSubmitTarget(null)}
        onConfirm={handleConfirmSubmit}
        title="Submit Draft Request?"
        description="Are you sure you want to submit this draft request for approval?"
        confirmText="Submit Request"
        cancelText="Cancel"
        variant="success"
        processing={submitProcessing}
      >
        {submitTarget && (
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs mt-2">
            <div>
              <span className="font-semibold text-slate-500">Request Number: </span>
              <span className="font-bold font-mono text-slate-900">{submitTarget.request_no}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-[11px] font-medium flex items-start space-x-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Once submitted, the request status will change to Pending Approval.</span>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </AppShell>
  );
}

