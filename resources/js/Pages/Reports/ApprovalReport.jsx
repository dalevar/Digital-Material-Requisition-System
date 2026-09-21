import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import StatusBadge from "@/Components/StatusBadge";
import StatCard from "@/Components/StatCard";
import {
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Download,
    Filter,
    RotateCcw,
    Eye,
} from "lucide-react";

export default function ApprovalReport({ requests, filters = {}, stats = {} }) {
    const [filterForm, setFilterForm] = useState({
        status: filters.status || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });

    const requestList = requests?.data || [];

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get("/reports/approvals", filterForm, { preserveState: true });
    };

    const handleResetFilter = () => {
        setFilterForm({ status: "", date_from: "", date_to: "" });
        router.get("/reports/approvals", {}, { preserveState: true });
    };

    const getExportUrl = () => {
        const params = new URLSearchParams();
        if (filterForm.status) params.append("status", filterForm.status);
        if (filterForm.date_from)
            params.append("date_from", filterForm.date_from);
        if (filterForm.date_to) params.append("date_to", filterForm.date_to);
        const queryString = params.toString();
        return `/reports/approvals/excel${queryString ? `?${queryString}` : ""}`;
    };

    return (
        <AppShell title="Approval Report">
            <Head title="Approval Report - DMRS" />

            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        Approval Audit & History Report
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Comprehensive audit report tracking material requisition
                        approvals, rejections, and approver decisions.
                    </p>
                </div>
                <a
                    href={getExportUrl()}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                    <Download className="w-4 h-4" />
                    <span>Export Excel</span>
                </a>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Audited Requests"
                    value={stats.totalCount ?? requestList.length}
                    subtitle="Matching current filter"
                    icon={FileText}
                    accentColor="slate"
                />
                <StatCard
                    title="Approved Requests"
                    value={stats.approvedCount ?? 0}
                    subtitle="Successfully approved"
                    icon={CheckCircle2}
                    accentColor="emerald"
                />
                <StatCard
                    title="Rejected Requests"
                    value={stats.rejectedCount ?? 0}
                    subtitle="Denied with reasoning"
                    icon={XCircle}
                    accentColor="rose"
                />
                <StatCard
                    title="Pending Approval"
                    value={stats.pendingCount ?? 0}
                    subtitle="Awaiting decision"
                    icon={Clock}
                    accentColor="amber"
                />
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6">
                <form
                    onSubmit={handleFilterSubmit}
                    className="flex flex-wrap items-end gap-3 text-xs"
                >
                    <div className="flex-1 min-w-[160px]">
                        <label className="block font-semibold text-slate-700 mb-1">
                            Status
                        </label>
                        <select
                            value={filterForm.status}
                            onChange={(e) =>
                                setFilterForm({
                                    ...filterForm,
                                    status: e.target.value,
                                })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="PENDING_APPROVAL">
                                PENDING_APPROVAL
                            </option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="CANCELLED_AFTER_APPROVAL">
                                CANCELLED_AFTER_APPROVAL
                            </option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block font-semibold text-slate-700 mb-1">
                            Date From
                        </label>
                        <input
                            type="date"
                            value={filterForm.date_from}
                            onChange={(e) =>
                                setFilterForm({
                                    ...filterForm,
                                    date_from: e.target.value,
                                })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block font-semibold text-slate-700 mb-1">
                            Date To
                        </label>
                        <input
                            type="date"
                            value={filterForm.date_to}
                            onChange={(e) =>
                                setFilterForm({
                                    ...filterForm,
                                    date_to: e.target.value,
                                })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            type="submit"
                            className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors shadow-xs"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filter</span>
                        </button>

                        {(filterForm.status ||
                            filterForm.date_from ||
                            filterForm.date_to) && (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="p-4">Request No</th>
                                <th className="p-4">Doc No</th>
                                <th className="p-4">Requester</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Approver</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4">
                                    Action / Rejection Reason
                                </th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requestList.length > 0 ? (
                                requestList.map((req) => {
                                    const latestHistory =
                                        req.approvalHistories &&
                                        req.approvalHistories.length > 0
                                            ? req.approvalHistories[
                                                  req.approvalHistories.length -
                                                      1
                                              ]
                                            : null;
                                    const reason =
                                        req.rejection_reason ||
                                        latestHistory?.reason ||
                                        "-";

                                    return (
                                        <tr
                                            key={req.id}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="p-4 font-bold text-slate-900">
                                                {req.request_no}
                                            </td>
                                            <td className="p-4 text-slate-500 font-medium">
                                                {req.no_doc || "-"}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-800">
                                                {req.requester?.name || "-"}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {req.department?.name || "-"}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {req.request_date || "-"}
                                            </td>
                                            <td className="p-4 font-medium text-slate-800">
                                                {req.approver?.name || "-"}
                                            </td>
                                            <td className="p-4 text-center">
                                                <StatusBadge
                                                    status={req.status}
                                                />
                                            </td>
                                            <td
                                                className="p-4 text-slate-600 max-w-[200px] truncate"
                                                title={reason}
                                            >
                                                {reason}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link
                                                    href={`/requests/${req.id}`}
                                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-red-600" />
                                                    <span>Detail View</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="p-8 text-center text-slate-400 font-medium"
                                    >
                                        No approval report records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Links */}
                {requests?.links && requests.links.length > 3 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Showing {requests.from || 0} to {requests.to || 0}{" "}
                            of {requests.total || 0} records
                        </div>
                        <div className="flex items-center space-x-1">
                            {requests.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url || link.active}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    className={`px-3 py-1 rounded border text-xs font-semibold ${
                                        link.active
                                            ? "bg-red-600 text-white border-red-600"
                                            : link.url
                                              ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                              : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
