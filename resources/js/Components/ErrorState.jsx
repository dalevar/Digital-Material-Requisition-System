import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to load information',
  description = 'Something went wrong while communicating with the server. Please try again or contact support if the issue persists.',
  onRetry = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 rounded-lg border border-red-200 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-red-900 mb-1">{title}</h3>
      <p className="text-xs text-red-700/80 max-w-md mb-4 leading-relaxed">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
