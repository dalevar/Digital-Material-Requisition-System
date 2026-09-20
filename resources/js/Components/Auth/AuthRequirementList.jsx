import React from 'react';

export default function AuthRequirementList({ requirements }) {
  const defaultRequirements = [
    { label: 'Use a secure password', met: true },
    { label: 'Password must satisfy application security policy', met: true },
  ];

  const items = Array.isArray(requirements) && requirements.length > 0
    ? requirements
    : defaultRequirements;

  return (
    <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1.5">
      <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1">
        Password requirements
      </span>
      <ul className="space-y-1">
        {items.map((req, idx) => {
          const label = typeof req === 'string' ? req : req.label;
          const isMet = typeof req === 'object' && req !== null ? req.met : true;

          return (
            <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isMet ? 'bg-blue-600' : 'bg-slate-300'}`} />
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
