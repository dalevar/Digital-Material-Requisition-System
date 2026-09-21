import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation Required',
  description,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  variant = 'warning',
  processing = false,
  children,
}) {
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: XCircle,
          iconBg: 'bg-red-100 text-red-600 border-red-200',
          btnBg: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
        };
      case 'info':
        return {
          icon: Info,
          iconBg: 'bg-sky-100 text-sky-600 border-sky-200',
          btnBg: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs',
        };
      case 'warning':
      default:
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-100 text-amber-600 border-amber-200',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
        };
    }
  };

  const style = getVariantStyles();
  const IconComponent = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white max-w-md w-full rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
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
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${style.iconBg}`}>
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-4">
            <h3 id="modal-title" className="text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            {description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>}
          </div>
        </div>

        {children && <div className="pt-2">{children}</div>}

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={processing}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 font-semibold text-xs rounded-md transition-colors disabled:opacity-50 ${style.btnBg}`}
          >
            {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{processing ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
