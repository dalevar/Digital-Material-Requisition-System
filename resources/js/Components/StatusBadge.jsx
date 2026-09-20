import React from 'react';

export default function StatusBadge({ status }) {
  const getBadgeStyle = (statusVal) => {
    switch (statusVal) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'SUBMITTED':
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING_APPROVAL':
      case 'LOW_STOCK':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED':
      case 'COMPLETED':
      case 'NORMAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
      case 'OUT_OF_STOCK':
      case 'CANCELLED_AFTER_APPROVAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getLabel = (statusVal) => {
    switch (statusVal) {
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'CANCELLED_AFTER_APPROVAL':
        return 'Cancelled (Post-Approval)';
      case 'LOW_STOCK':
        return 'Low Stock';
      case 'OUT_OF_STOCK':
        return 'Out of Stock';
      default:
        return statusVal;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(status)}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {getLabel(status)}
    </span>
  );
}
