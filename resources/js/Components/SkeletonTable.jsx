import React from 'react';

export default function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs animate-pulse">
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="h-4 bg-slate-300 rounded w-1/4" />
        <div className="h-4 bg-slate-200 rounded w-1/6" />
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-4 py-3.5 flex justify-between items-center space-x-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-3.5 bg-slate-200 rounded"
                style={{ width: `${Math.max(40, 100 - cIdx * 15)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
