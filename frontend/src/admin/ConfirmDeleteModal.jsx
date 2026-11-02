import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  title = 'Confirm Deletion',
  itemName = '',
  itemType = 'item',
  warningMessage = null,
  forceCheckbox = false,
  forceCheckboxLabel = 'Delete all items associated with this category',
  forceChecked = false,
  onForceChange = () => {},
  loading = false,
  errorMessage = null,
  onConfirm = () => {},
  onClose = () => {},
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={!loading ? onClose : undefined}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-red-100 z-10 p-6 space-y-5 animate-scaleUp">
        {/* Header with Icon and Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900 leading-snug">
                {title}
              </h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete this {itemType}?
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition disabled:opacity-50"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Item Card */}
        {itemName && (
          <div className="p-3.5 bg-red-50/70 border border-red-100 rounded-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block mb-0.5">
              Target {itemType}:
            </span>
            <span className="font-serif font-bold text-sm text-red-950 block break-words">
              {itemName}
            </span>
          </div>
        )}

        {/* Warning Details */}
        {warningMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed space-y-1">
              <p className="font-semibold text-amber-900">Warning:</p>
              <p className="text-amber-800">{warningMessage}</p>
            </div>
          </div>
        )}

        {/* Force Cascade Checkbox */}
        {forceCheckbox && (
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100/70 transition">
            <input
              type="checkbox"
              checked={forceChecked}
              onChange={(e) => onForceChange(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-xs font-medium text-gray-800 leading-snug">
              {forceCheckboxLabel}
            </span>
          </label>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || (forceCheckbox && !forceChecked)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-xs font-bold text-white shadow-md shadow-red-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
