import React, { useState } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import StatusBadge from '@/Components/StatusBadge';
import { Download, ArrowLeft, CheckCircle2, XCircle, Edit, Ban, Boxes } from 'lucide-react';

export default function Show({ request, plants }) {
  const { auth } = usePage().props;
  const user = auth.user;

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [supplementModalOpen, setSupplementModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

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

  const handleIssueStock = () => {
    if (confirm("Are you sure you want to issue stock for this request? This will deduct SOH and mark request as COMPLETED.")) {
      router.post(`/admin/requests/${request.id}/issue-stock`);
    }
  };

  const canApprove = (user.role === 'APPROVER' || user.role === 'ADMIN') &&
    user.id !== request.requester_id &&
    ['SUBMITTED', 'PENDING_APPROVAL'].includes(request.status);

  const canSupplement = user.role === 'ADMIN' && request.status === 'APPROVED';
  const canCancelApproved = user.role === 'ADMIN' && ['APPROVED', 'PROCESSING'].includes(request.status);
  const canIssueStock = user.role === 'ADMIN' && ['APPROVED', 'PROCESSING'].includes(request.status);

  return (
    <AppShell title={`Request ${request.request_no}`}>
      <Head title={`MRF ${request.request_no} - DMRS`} />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/requests" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Requests
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">{request.request_no}</h1>
            <StatusBadge status={request.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/requests/${request.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF MRF</span>
          </a>

          {canApprove && (
            <>
              <button
                onClick={() => setApproveModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Request</span>
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Request</span>
              </button>
            </>
          )}

          {canSupplement && (
            <button
              onClick={() => setSupplementModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Edit className="w-4 h-4" />
              <span>Supplement MRF (Admin)</span>
            </button>
          )}

          {canIssueStock && (
            <button
              onClick={handleIssueStock}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Boxes className="w-4 h-4" />
              <span>Issue Stock & Complete</span>
            </button>
          )}

          {canCancelApproved && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel Request (Post-Approval)</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Info Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Header Details</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400 font-semibold">Requester</div>
            <div className="font-bold text-slate-900 mt-0.5">{request.requester?.name}</div>
            <div className="text-[11px] text-slate-500">{request.requester?.employee_id}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold">Department</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.department?.name || '-'}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold">Plant</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.plant?.name || '-'}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold">Request Date</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.request_date}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold">Doc Reference No</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.no_doc || '-'}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold">G/L Account</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.gl_account || '-'}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold">PWO No.</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.pwo_no || '-'}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold">Cost Center</div>
            <div className="font-semibold text-slate-800 mt-0.5">{request.cost_center || '-'}</div>
          </div>
        </div>

        {request.rejection_reason && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <strong className="font-bold">Rejection Reason:</strong> {request.rejection_reason}
          </div>
        )}
      </div>

      {/* Item Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Requisitioned Material Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Material No</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Requested Qty</th>
                <th className="p-3 text-center">UoM</th>
                <th className="p-3 text-right">SOH</th>
                <th className="p-3 text-right">Est. Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {request.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900">{item.material?.material_number}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{parseFloat(item.qty).toFixed(2)}</td>
                  <td className="p-3 text-center">{item.uom}</td>
                  <td className="p-3 text-right">{parseFloat(item.soh).toFixed(2)}</td>
                  <td className={`p-3 text-right font-bold ${item.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {parseFloat(item.balance).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Approval & Audit Timeline</h2>
        {request.approval_histories.length === 0 ? (
          <p className="text-xs text-slate-400">No approval actions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {request.approval_histories.map((hist) => (
              <div key={hist.id} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <StatusBadge status={hist.action} />
                <div className="flex-1">
                  <div className="font-bold text-slate-800">{hist.approver?.name}</div>
                  <div className="text-slate-600 mt-0.5">{hist.reason}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{hist.action_at}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Approve Request</h3>
            <p className="text-xs text-slate-500 mb-4">Are you sure you want to approve request {request.request_no}?</p>

            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Approval Note (Optional)</label>
                <textarea
                  rows="3"
                  value={approveForm.data.reason}
                  onChange={(e) => approveForm.setData('reason', e.target.value)}
                  placeholder="Optional approval note..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approveForm.processing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reject Request</h3>
            <p className="text-xs text-slate-500 mb-4">Rejection requires a mandatory rejection reason.</p>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason *</label>
                <textarea
                  rows="3"
                  value={rejectForm.data.rejection_reason}
                  onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                  placeholder="State clear reason for rejection..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
                {rejectForm.errors.rejection_reason && (
                  <p className="text-xs text-rose-600 mt-1">{rejectForm.errors.rejection_reason}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectForm.processing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplement Modal (Admin) */}
      {supplementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Supplement MRF Fields (Admin)</h3>
            <p className="text-xs text-slate-500">Edit MRF fields post-approval. All changes are logged to Audit Trail.</p>

            <form onSubmit={handleSupplement} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">G/L Account</label>
                  <input
                    type="text"
                    value={supplementForm.data.gl_account}
                    onChange={(e) => supplementForm.setData('gl_account', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">PWO No.</label>
                  <input
                    type="text"
                    value={supplementForm.data.pwo_no}
                    onChange={(e) => supplementForm.setData('pwo_no', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pur Org</label>
                  <input
                    type="text"
                    value={supplementForm.data.pur_org}
                    onChange={(e) => supplementForm.setData('pur_org', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pur Group</label>
                  <input
                    type="text"
                    value={supplementForm.data.pur_group}
                    onChange={(e) => supplementForm.setData('pur_group', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cost Center</label>
                  <input
                    type="text"
                    value={supplementForm.data.cost_center}
                    onChange={(e) => supplementForm.setData('cost_center', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Doc Reference No</label>
                  <input
                    type="text"
                    value={supplementForm.data.no_doc}
                    onChange={(e) => supplementForm.setData('no_doc', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason for Admin Change *</label>
                <input
                  type="text"
                  value={supplementForm.data.reason}
                  onChange={(e) => supplementForm.setData('reason', e.target.value)}
                  placeholder="State mandatory reason for change..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSupplementModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={supplementForm.processing}
                  className="px-4 py-2 bg-blue-700 text-white font-semibold text-xs rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Approved Modal (Admin) */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Cancel Approved Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Cancelling an approved request will mark it as CANCELLED_AFTER_APPROVAL. If stock was already issued, an automatic REVERSAL transaction will return items to inventory SOH.
            </p>

            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Reason *</label>
                <textarea
                  rows="3"
                  value={cancelForm.data.cancellation_reason}
                  onChange={(e) => cancelForm.setData('cancellation_reason', e.target.value)}
                  placeholder="e.g. User cancelled material pickup..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={cancelForm.processing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl"
                >
                  Confirm Cancellation & Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
