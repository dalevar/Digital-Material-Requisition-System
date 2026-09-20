import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import StatusBadge from "@/Components/StatusBadge";
import StatCard from "@/Components/StatCard";
import EmptyState from "@/Components/EmptyState";
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    PlusCircle,
    ArrowRight,
    FilePlus,
} from "lucide-react";

export default function UserDashboard({ stats = {}, recentRequests = [] }) {
    const breadcrumbs = [
        { title: "Requester Portal", href: null },
        { title: "Dashboard", href: null },
    ];

    return (
        <AppShell title="User Dashboard" breadcrumbs={breadcrumbs}>
            <Head title="Requester Dashboard - DMRS" />

            {/* Hero CTA Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8  bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
                <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] border border-slate-200  text-slate-900 uppercase tracking-wider">
                        Material Requisition Form (MRF)
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight pt-1">
                        Material Requisition Portal
                    </h1>
                    <p className="text-xs text-slate-500  max-w-xl leading-relaxed">
                        Create new material requests, track approval status in
                        real-time, and download official MRF documentation.
                    </p>
                </div>
                <Link
                    href="/requests/create"
                    className="inline-flex items-center justify-center space-x-2 px-5 py-3  bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold shadow-sm transition-all shrink-0"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create New Request</span>
                </Link>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="My Total Requests"
                    value={stats.myRequests || 0}
                    subtitle="All submitted & drafts"
                    icon={FileText}
                />
                <StatCard
                    title="Pending Approval"
                    value={stats.pending || 0}
                    subtitle="Awaiting Executive / HoD review"
                    icon={Clock}
                    variant={stats.pending > 0 ? "accent" : "default"}
                />
                <StatCard
                    title="Approved Requests"
                    value={stats.approved || 0}
                    subtitle="Ready for stock processing"
                    icon={CheckCircle2}
                    variant="success"
                />
                <StatCard
                    title="Rejected Requests"
                    value={stats.rejected || 0}
                    subtitle="Declined by Approver"
                    icon={XCircle}
                    variant={stats.rejected > 0 ? "danger" : "default"}
                />
            </div>

            {/* Recent Requests Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        <h2 className="text-sm font-bold text-slate-900">
                            Recent Material Requisitions
                        </h2>
                    </div>
                    <Link
                        href="/requests"
                        className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                        <span>View All My Requests</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentRequests && recentRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Request No</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {recentRequests.map((req) => (
                                    <tr
                                        key={req.id}
                                        className="hover:bg-red-50/20 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-bold text-red-700">
                                            {req.request_no}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {req.request_date}
                                        </td>
                                        <td className="px-4 py-3">
                                            {req.department?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/requests/${req.id}`}
                                                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={FilePlus}
                        title="No material requisitions found"
                        description="You haven't submitted any material requisition forms yet. Click 'Create New Request' to start."
                        action={
                            <Link
                                href="/requests/create"
                                className="inline-flex items-center space-x-2 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Create New Request</span>
                            </Link>
                        }
                    />
                )}
            </div>
        </AppShell>
    );
}
