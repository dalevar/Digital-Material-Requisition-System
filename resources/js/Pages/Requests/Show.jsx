import React, { useState } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { Download, ArrowLeft, CheckCircle2, XCircle, Edit, Ban, Boxes, AlertTriangle, Check, Clock, User, Building2, Factory, Calendar, ShieldCheck, Info } from 'lucide-react';

export default function Show({ request, plants = [] }) {
  const { auth } = usePage().props;
  const user = auth.user;

  const breadcrumbs = [
    { title: 'Material Requests', href: '/requests' },
    { title: request.request_no, href: null },
  ];

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [supplementModalOpen, setSupplementModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [stockOutModalOpen, setStockOutModalOpen] = useState(false);
  const [stockOutProcessing, setStockOutProcessing] = useState(false);

  // Forms
  const approveForm = useForm({ reason: '' });
  const rejectForm = useForm({ rejection_reason: '' });
  const supplementForm = useForm({
    no_doc: request.no_doc || '',
    plant_id: request.plant_id || '',
    gl_account: request.gl_account || '',
    pwo_no: request.pwo_no || '',
    pur_org: request.pur_org || '',
    pur_group: request.pur_group || '',
    cost_center: request.cost_center || '',
    reason: '',
  });
  const cancelForm = useForm({ cancellation_reason: '' });

  const handleApprove = (e) => {
    e.preventDefault();
    approveForm.post(`/approvals/${request.id}/approve`, {
      onSuccess: () => setApproveModalOpen(false),
    });
  };

  const handleReject = (e) => {
    e.preventDefault();
    rejectForm.post(`/approvals/${request.id}/reject`, {
      onSuccess: () => setRejectModalOpen(false),
    });
  };

  const handleSupplement = (e) => {
    e.preventDefault();
    supplementForm.patch(`/admin/requests/${request.id}/supplement`, {
      onSuccess: () => setSupplementModalOpen(false),
    });
  };

  const handleCancel = (e) => {
    e.preventDefault();
    cancelForm.post(`/admin/requests/${request.id}/cancel`, {
      onSuccess: () => setCancelModalOpen(false),
    });
  };

  const handleConfirmStockOut = () => {
    setStockOutProcessing(true);
    router.post(`/admin/requests/${request.id}/issue-stock`, {}, {
      onFinish: () => {
        setStockOutProcessing(false);
        setStockOutModalOpen(false);
      },
    });
  };

  const canApprove = (user.role === 'APPROVER' || user.role === 'EXECUTIVE') &&
    user.id !== request.requester_id &&
    ['SUBMITTED', 'PENDING_APPROVAL'].includes(request.status);

  const canSupplement = user.role === 'ADMIN' && ['APPROVED', 'PROCESSING'].includes(request.status);
  const canCancelApproved = user.role === 'ADMIN' && ['APPROVED', 'PROCESSING'].includes(request.status);
  const canIssueStock = user.role === 'ADMIN' && ['APPROVED', 'PROCESSING'].includes(request.status);

  // Workflow stepper calculations
  const steps = [
    { key: 'DRAFT', label: 'Draft' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getCurrentStepIndex = () => {
    if (request.status === 'REJECTED' || request.status === 'CANCELLED_AFTER_APPROVAL' || request.status === 'CANCELLED') {
      return -1;
    }
    const idx = steps.findIndex((s) => s.key === request.status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <AppShell title={`Request ${request.request_no}`} breadcrumbs={breadcrumbs}>
      <Head title={`MRF ${request.request_no} - DMRS`} />

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/requests" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-red-600 mb-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Requisitions List
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{request.request_no}</h1>
            <StatusBadge status={request.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/requests/${request.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-red-600" />
            <span>Download Official PDF MRF</span>
          </a>

          {canApprove && (
            <>
              <button
                onClick={() => setApproveModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Request</span>
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Request</span>
              </button>
            </>
          )}

          {canSupplement && (
            <button
              onClick={() => setSupplementModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Approved MRF</span>
            </button>
          )}

          {canIssueStock && (
            <button
              onClick={() => setStockOutModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Boxes className="w-4 h-4" />
              <span>Process Stock Out</span>
            </button>
          )}

          {canCancelApproved && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-md text-xs font-semibold transition-colors"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Workflow Progress Stepper */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Request Lifecycle Progress
        </h2>

        {request.status === 'REJECTED' || request.status === 'CANCELLED_AFTER_APPROVAL' || request.status === 'CANCELLED' ? (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 flex items-center space-x-3 text-red-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <strong className="font-bold">Lifecycle Terminated:</strong> This requisition has reached end-state status: <StatusBadge status={request.status} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
            {steps.map((step, idx) => {
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center min-w-[90px]">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-red-600 text-white ring-4 ring-red-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-semibold mt-1.5 text-center ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 min-w-[20px] ${idx < currentStepIdx ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Header Information Grid */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs mb-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          Request Header Details
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-500 font-medium">Requester</div>
            <div className="font-bold text-slate-900 mt-0.5">{request.requester?.name || '-'}</div>
            <div className="text-[11px] text-slate-400">ID: {request.requester?.employee_id || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Department</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.department?.name || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Plant</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.plant?.name || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Request Date</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.request_date}</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Doc Archive Reference</div>
            <div className="font-mono font-semibold text-slate-800 mt-0.5">{request.no_doc || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">G/L Account</div>
            <div className="font-mono font-semibold text-slate-800 mt-0.5">{request.gl_account || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">PWO No.</div>
            <div className="font-mono font-semibold text-slate-800 mt-0.5">{request.pwo_no || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Cost Center</div>
            <div className="font-mono font-semibold text-slate-800 mt-0.5">{request.cost_center || '-'}</div>
          </div>
        </div>

        {request.reason && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium text-xs">Operational Reason / Purpose:</span>
            <p className="text-xs text-slate-800 font-normal mt-0.5 leading-relaxed">{request.reason}</p>
          </div>
        )}

        {request.rejection_reason && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-900 text-xs mt-3">
            <strong className="font-bold text-red-800">Rejection Reason:</strong> {request.rejection_reason}
          </div>
        )}
      </div>

      {/* Material Items Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden mb-6 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Requisitioned Material Items List
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-center w-10">No</th>
                <th className="px-3 py-2.5">Material Number</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="px-3 py-2.5 text-right w-28">Requested Qty</th>
                <th className="px-3 py-2.5 text-center w-20">UoM</th>
                <th className="px-3 py-2.5 text-right w-28">SOH</th>
                <th className="px-3 py-2.5 text-right w-28">Est. Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {request.items && request.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-bold text-red-700">{item.material?.material_number || '-'}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900">{item.description}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">{parseFloat(item.qty).toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-center font-semibold text-slate-500">{item.uom}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-700">{parseFloat(item.soh || 0).toFixed(2)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono font-bold ${item.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {parseFloat(item.balance || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval History & Audit Log */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Approval & Audit History Log
        </h2>
        {request.approval_histories && request.approval_histories.length > 0 ? (
          <div className="space-y-3">
            {request.approval_histories.map((hist) => (
              <div key={hist.id} className="flex items-start space-x-3 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
                <StatusBadge status={hist.action} />
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{hist.approver?.name || 'System / Admin'}</div>
                  {hist.reason && <div className="text-slate-600 mt-0.5 font-medium">{hist.reason}</div>}
                  <div className="text-[10px] text-slate-400 mt-1">{hist.action_at}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium">No approval actions recorded yet.</p>
        )}
      </div>

      {/* Modals */}
      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Approve Material Requisition</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to approve request <strong className="text-slate-900">{request.request_no}</strong>? Approval marks request as READY FOR STOCK PROCESSING.
            </p>

            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Approval Note (Optional)</label>
                <textarea
                  rows="3"
                  value={approveForm.data.reason}
                  onChange={(e) => approveForm.setData('reason', e.target.value)}
                  placeholder="Optional approval note..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approveForm.processing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-xs"
                >
                  Confirm Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reject Material Requisition</h3>
            <p className="text-xs text-slate-500">Rejection requires a mandatory rejection reason.</p>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows="3"
                  value={rejectForm.data.rejection_reason}
                  onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                  placeholder="State clear reason for rejection..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
                {rejectForm.errors.rejection_reason && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{rejectForm.errors.rejection_reason}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectForm.processing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplement Modal (Admin Edit Approved Request) */}
      {supplementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-lg w-full rounded-lg p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Approved Request (Admin Actions)</h3>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mt-2 text-xs text-amber-900">
                <strong className="font-bold">⚠️ Notice:</strong> Administrative edits are limited to Plant, G/L Account, PWO No., Pur Org, Pur Group, and Cost Center. All changes require a reason and will record BEFORE vs AFTER values in the Audit Trail.
              </div>
            </div>

            <form onSubmit={handleSupplement} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">G/L Account</label>
                  <input
                    type="text"
                    value={supplementForm.data.gl_account}
                    onChange={(e) => supplementForm.setData('gl_account', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                  {request.gl_account !== supplementForm.data.gl_account && (
                    <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                      Diff: {request.gl_account || 'empty'} → {supplementForm.data.gl_account}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">PWO No.</label>
                  <input
                    type="text"
                    value={supplementForm.data.pwo_no}
                    onChange={(e) => supplementForm.setData('pwo_no', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                  {request.pwo_no !== supplementForm.data.pwo_no && (
                    <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                      Diff: {request.pwo_no || 'empty'} → {supplementForm.data.pwo_no}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pur Org</label>
                  <input
                    type="text"
                    value={supplementForm.data.pur_org}
                    onChange={(e) => supplementForm.setData('pur_org', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pur Group</label>
                  <input
                    type="text"
                    value={supplementForm.data.pur_group}
                    onChange={(e) => supplementForm.setData('pur_group', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cost Center</label>
                  <input
                    type="text"
                    value={supplementForm.data.cost_center}
                    onChange={(e) => supplementForm.setData('cost_center', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                  {request.cost_center !== supplementForm.data.cost_center && (
                    <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                      Diff: {request.cost_center || 'empty'} → {supplementForm.data.cost_center}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Doc Reference No</label>
                  <input
                    type="text"
                    value={supplementForm.data.no_doc}
                    onChange={(e) => supplementForm.setData('no_doc', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Admin Change <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={supplementForm.data.reason}
                  onChange={(e) => supplementForm.setData('reason', e.target.value)}
                  placeholder="State mandatory reason for change..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSupplementModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={supplementForm.processing}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs"
                >
                  Save Administrative Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Approved Modal (Admin) */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancel Approved Request</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cancelling an approved request marks status as <strong className="text-red-700">CANCELLED_AFTER_APPROVAL</strong>. If a STOCK_OUT transaction already occurred, an automatic REVERSAL transaction will be rendered to restore inventory SOH.
            </p>

            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cancellation Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows="3"
                  value={cancelForm.data.cancellation_reason}
                  onChange={(e) => cancelForm.setData('cancellation_reason', e.target.value)}
                  placeholder="e.g. User cancelled material pickup / project scope change..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={cancelForm.processing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Stock Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={stockOutModalOpen}
        onClose={() => setStockOutModalOpen(false)}
        onConfirm={handleConfirmStockOut}
        title="Process Stock Out"
        description="Are you sure you want to process stock out for this request?"
        confirmText="Process Stock Out"
        cancelText="Cancel"
        variant="danger"
        processing={stockOutProcessing}
      >
        <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs mt-2">
          <div>
            <span className="font-semibold text-slate-500">Request Number:</span>
            <span className="font-bold font-mono text-slate-900 ml-2">{request.request_no}</span>
          </div>

          <div>
            <span className="font-semibold text-slate-500 block mb-1">Material Items to Issue:</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {request.items && request.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-red-700">{item.material?.material_number}</span>
                    <span className="text-slate-700 ml-2 font-medium">{item.description}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{parseFloat(item.qty).toFixed(2)} {item.uom}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-[11px] font-medium flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Stock On Hand (SOH) will be deducted immediately. This action cannot be undone.</span>
          </div>
        </div>
      </ConfirmationModal>
    </AppShell>
  );
}

