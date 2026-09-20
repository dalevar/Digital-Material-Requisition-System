import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthSubmitButton({
  children,
  loading = false,
  loadingText = 'Processing...',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs rounded-md shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
