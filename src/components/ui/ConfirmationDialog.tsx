import React from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-canvas border border-hairline rounded-lg p-6 shadow-xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-lg font-medium text-ink mb-2">{title}</h3>
        <p className="text-sm text-body mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary !px-4 !py-2 text-sm rounded-lg"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn-primary !px-4 !py-2 text-sm rounded-lg ${
              isDanger ? "!bg-error active:!bg-error/90 hover:opacity-90" : ""
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
