import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  description = 'Are you sure you want to delete this record? This action cannot be undone.',
  itemName,
  confirmText = 'DELETE',
  processing = false,
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !processing && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, processing, onClose]);

  if (!isOpen) return null;

  const isValid = inputValue.trim() === confirmText;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && !processing && onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white max-w-md w-full rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 bg-red-100 text-red-600 border-red-200">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-4">
            <h3 id="delete-modal-title" className="text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {description}
            </p>
            {itemName && (
              <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 font-mono break-all">
                {itemName}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs text-slate-600 mb-1.5 font-medium">
              To confirm, type <span className="font-bold text-slate-900 font-mono">"{confirmText}"</span> in the box below:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Type ${confirmText} to confirm...`}
              disabled={processing}
              autoFocus
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || processing}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-red-600 disabled:cursor-not-allowed shadow-xs"
            >
              {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{processing ? 'Deleting...' : 'Delete Data'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
