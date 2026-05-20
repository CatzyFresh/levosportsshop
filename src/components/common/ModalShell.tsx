"use client";

import type { ReactNode } from "react";

type ModalShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  maxWidth?: string;
};

export default function ModalShell({
  title,
  description,
  children,
  footer,
  onClose,
  maxWidth = "max-w-lg",
}: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className={`w-full ${maxWidth} rounded-xl bg-white shadow-xl`}>
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-950">{title}</h3>

            {description && (
              <p className="mt-1 text-slate-500">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 text-2xl leading-none text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="p-6">{children}</div>

        <div className="flex justify-end gap-3 border-t border-slate-200 p-6">
          {footer}
        </div>
      </div>
    </div>
  );
}