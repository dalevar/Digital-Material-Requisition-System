import React from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function StockStatusBadge({ soh = 0, minStock = 0 }) {
  let status = 'NORMAL';
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;

  if (soh <= 0) {
    status = 'OUT OF STOCK';
    badgeClass = 'bg-red-50 text-red-700 border-red-200';
    Icon = XCircle;
  } else if (soh <= minStock) {
    status = 'LOW STOCK';
    badgeClass = 'bg-orange-50 text-orange-700 border-orange-200';
    Icon = AlertCircle;
  }

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${badgeClass}`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </span>
  );
}
