import React from 'react';

export default function StatusBadge({ status, showIcon = true }) {
  const getBadgeStyle = (statusVal) => {
    switch (statusVal) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'SUBMITTED':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'PROCESSING':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'CANCELLED_AFTER_APPROVAL':
        return 'bg-red-100/60 text-red-900 border-red-300 ring-1 ring-red-400/30';
      case 'NORMAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LOW STOCK':
      case 'LOW_STOCK':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'OUT OF STOCK':
      case 'OUT_OF_STOCK':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getLabel = (statusVal) => {
    switch (statusVal) {
      case 'PENDING_APPROVAL':
        return 'PENDING APPROVAL';
      case 'CANCELLED_AFTER_APPROVAL':
        return 'CANCELLED (POST-APPROVAL)';
      case 'LOW_STOCK':
        return 'LOW STOCK';
      case 'OUT_OF_STOCK':
        return 'OUT OF STOCK';
      default:
        return statusVal ? statusVal.toString().replace(/_/g, ' ') : '';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getBadgeStyle(status)}`}>
      {showIcon && <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80" />}
      {getLabel(status)}
    </span>
  );
}

